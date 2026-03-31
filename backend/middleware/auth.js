const jwt          = require('jsonwebtoken')
const InsightUser  = require('../models/InsightUser')

const protect = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await InsightUser.findById(decoded.id).select('-password')
      next()
    } catch {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' })
}

module.exports = { protect }