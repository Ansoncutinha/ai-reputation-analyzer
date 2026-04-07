const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Feedback = require('../models/Feedback')
const SiteUser = require('../models/SiteUser')
const Cache = require('../models/InsightCache')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

// GET — return cached insights (no API call)
router.get('/', protect, async (req, res) => {
  try {
    const cached = await Cache.findOne({ ownerId: req.user._id })
    if (cached) {
      return res.json({ insights: cached.insights, generatedAt: cached.generatedAt, cached: true })
    }
    res.json({ insights: null, cached: false })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST — generate new insights via Gemini (only on button click)
router.post('/generate', protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(50)
    const users = await SiteUser.find()

    const total = feedbacks.length
    const positive = feedbacks.filter(f => f.sentiment === 'Positive').length
    const neutral = feedbacks.filter(f => f.sentiment === 'Neutral').length
    const negative = feedbacks.filter(f => f.sentiment === 'Negative').length
    const avg = total > 0
      ? (feedbacks.reduce((s, f) => s + (f.sentimentScore || 3), 0) / total).toFixed(2)
      : 0

    const posPercent = total > 0 ? Math.round((positive / total) * 100) : 0
    const negPercent = total > 0 ? Math.round((negative / total) * 100) : 0
    const neuPercent = total > 0 ? Math.round((neutral / total) * 100) : 0

    const recentTexts = feedbacks
      .slice(0, 20)
      .map(f => `[${f.rating} stars] ${f.feedbackText}`)
      .join('\n')

    const prompt = `
You are a business analyst AI for InsightFlow, a feedback analytics dashboard.

Feedback data summary:
- Total feedback collected: ${total}
- Average sentiment score: ${avg} out of 5
- Positive feedback: ${posPercent}%
- Neutral feedback: ${neuPercent}%
- Negative feedback: ${negPercent}%
- Total site users tracked: ${users.length}

Recent customer feedback samples:
${recentTexts || 'No feedback yet. Give general startup business advice.'}

Respond ONLY in this exact JSON format, no markdown, no backticks, pure JSON only:
{
  "powerSummary": "One powerful sentence combining the score, main complaint, and what to improve. Make it specific and actionable.",
  "summary": "One sentence overall business health assessment",
  "trend": "improving or declining or stable",
  "whatCustomersLike": ["specific item 1", "specific item 2", "specific item 3"],
  "whatCustomersComplainAbout": ["specific complaint 1", "specific complaint 2", "specific complaint 3"],
  "keyIssues": [
    { "issue": "issue title", "severity": "high or medium or low", "detail": "one line specific explanation" },
    { "issue": "issue title", "severity": "high or medium or low", "detail": "one line specific explanation" },
    { "issue": "issue title", "severity": "high or medium or low", "detail": "one line specific explanation" }
  ],
  "actionSuggestions": [
    { "action": "action title", "impact": "high or medium", "detail": "one line specific explanation" },
    { "action": "action title", "impact": "high or medium", "detail": "one line specific explanation" },
    { "action": "action title", "impact": "high or medium", "detail": "one line specific explanation" },
    { "action": "action title", "impact": "high or medium", "detail": "one line specific explanation" }
  ],
  "trendInsight": "One sentence about the recent trend direction and what it means for the business"
}
`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const geminiData = await geminiRes.json()

    if (geminiData.error) {
      console.error('Gemini API error:', geminiData.error.message)
      return res.status(500).json({ message: 'Gemini error: ' + geminiData.error.message })
    }

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const insights = JSON.parse(cleanText)

    await Cache.findOneAndUpdate(
      { ownerId: req.user._id },
      { ownerId: req.user._id, insights, generatedAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    )

    if (req.user.emailAISummary) {
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1f2e;color:#e2e8f0;padding:32px;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="color:#00f5d4;font-size:24px;font-weight:700;">InsightFlow</span>
          </div>
          <h2 style="color:white;font-size:20px;margin-bottom:8px;">New AI Insights Generated</h2>
          <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">
            Your dashboard AI has regenerated customer insights based on recent feedback.
          </p>
          <div style="background:#232936;padding:20px;border-radius:8px;margin-bottom:24px;border:1px solid rgba(0,245,212,0.2);">
            <h3 style="color:#00f5d4;margin-top:0;font-size:16px;">Executive Summary</h3>
            <p style="margin:0;font-size:14px;line-height:1.6;">${insights.powerSummary}</p>
          </div>
          <h3 style="color:white;font-size:16px;margin-bottom:12px;">Action Suggestions</h3>
          <ul style="padding-left:20px;margin-bottom:24px;">
            ${(insights.actionSuggestions || []).map(a => `<li style="margin-bottom:8px;font-size:14px;"><strong>${a.action}</strong>: ${a.detail}</li>`).join('')}
          </ul>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="http://localhost:5173/insights"
               style="display:inline-block;padding:12px 24px;background:#00f5d4;color:#0d1117;
                      border-radius:9999px;font-weight:700;font-size:14px;text-decoration:none;">
              View Full Dashboard
            </a>
          </div>
        </div>
      `
      transporter.sendMail({
        from: '"InsightFlow AI" <' + process.env.GMAIL_USER + '>',
        to: req.user.email,
        subject: 'InsightFlow — Your AI Performance Summary',
        html: emailHtml
      }).catch(err => console.error('Failed to send AI summary email:', err.message))
    }

    res.json({ insights, generatedAt: new Date(), cached: false })
  } catch (err) {
    console.error('Insights error:', err.message)
    res.status(500).json({ message: 'Failed to generate insights: ' + err.message })
  }
})

module.exports = router