const express      = require('express')
const router       = express.Router()
const crypto       = require('crypto')
const nodemailer   = require('nodemailer')
const InsightUser  = require('../models/InsightUser')

const resetTokens = {}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

// POST /api/reset-password/request
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await InsightUser.findOne({ email })

    if (!user) {
      return res.json({ message: 'If this email exists, a reset link has been sent.' })
    }

    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 15 * 60 * 1000
    resetTokens[token] = { email, expiresAt }

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`

    await transporter.sendMail({
      from:    `"InsightFlow" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: 'InsightFlow — Password Reset Link',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#1a1f2e;color:#e2e8f0;padding:32px;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="color:#00f5d4;font-size:24px;font-weight:700;">InsightFlow</span>
          </div>
          <h2 style="color:white;font-size:20px;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">
            We received a request to reset the password for your InsightFlow account.
            Click the button below to set a new password.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetLink}"
               style="display:inline-block;padding:14px 32px;background:#00f5d4;color:#0d1117;
                      border-radius:9999px;font-weight:700;font-size:15px;text-decoration:none;">
              Reset Password
            </a>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center;">
            This link expires in 15 minutes. If you did not request this, ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #2a3040;margin:24px 0;"/>
          <p style="color:#334155;font-size:11px;text-align:center;">InsightFlow — AI Sentiment Analytics</p>
        </div>
      `
    })

    res.json({ message: 'If this email exists, a reset link has been sent.' })
  } catch (err) {
    console.error('Reset email error:', err.message)
    res.status(500).json({ message: 'Failed to send reset email. Try again.' })
  }
})

// POST /api/reset-password/confirm
router.post('/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password required' })
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const record = resetTokens[token]
    if (!record) return res.status(400).json({ message: 'Invalid or expired reset link' })
    if (Date.now() > record.expiresAt) {
      delete resetTokens[token]
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' })
    }

    const user = await InsightUser.findOne({ email: record.email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.password = newPassword
    await user.save()
    delete resetTokens[token]

    res.json({ message: 'Password reset successfully! You can now login.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router