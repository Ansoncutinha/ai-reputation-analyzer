const jwt         = require('jsonwebtoken')
const bcrypt      = require('bcryptjs')
const InsightUser = require('../models/InsightUser')

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body
    if (await InsightUser.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' })
    if (await InsightUser.findOne({ username }))
      return res.status(400).json({ message: 'Username already taken' })
    const user = await InsightUser.create({ fullName, username, email, password })
    res.status(201).json({
      _id: user._id, fullName: user.fullName,
      username: user.username, email: user.email,
      plan: user.plan, emailAISummary: user.emailAISummary, token: makeToken(user._id)
    })
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body
    const identifier = email || username
    const user = await InsightUser.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email/username or password' })
    user.lastLogin = new Date()
    await user.save()
    res.json({
      _id: user._id, fullName: user.fullName,
      username: user.username, email: user.email,
      plan: user.plan, emailAISummary: user.emailAISummary, token: makeToken(user._id)
    })
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.getMe = async (req, res) => {
  res.json(req.user)
}

exports.updateMe = async (req, res) => {
  try {
    const user = await InsightUser.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const { fullName, username, email, password, currentPassword, emailAISummary } = req.body

    if (password) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password is required' })
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch)
        return res.status(401).json({ message: 'Current password is incorrect' })
    }

    if (fullName) user.fullName = fullName
    if (username) user.username = username
    if (email)    user.email    = email
    if (password) user.password = password
    if (emailAISummary !== undefined) user.emailAISummary = emailAISummary

    await user.save()
    res.json({ message: 'Updated successfully', user: {
      _id: user._id, fullName: user.fullName,
      username: user.username, email: user.email,
      plan: user.plan, emailAISummary: user.emailAISummary
    }})
  } catch (e) { res.status(500).json({ message: e.message }) }
}