const SiteUser = require('../models/SiteUser')
const Site     = require('../models/Site')

exports.trackSiteUser = async (req, res) => {
  try {
    const { apiKey, fullName, username, email, password, status } = req.body

    const site = await Site.findOne({ apiKey })
    if (!site) return res.status(404).json({ message: 'Invalid API key' })

    let user = await SiteUser.findOne({ siteId: site._id, email })

    if (user) {
      user.lastLogin  = new Date()
      user.status     = status || 'Online'
      user.loginCount = status === 'Offline' ? user.loginCount : (user.loginCount || 0) + 1
      if (fullName) user.fullName = fullName
      if (username) user.username = username
      if (password) user.password = password
      await user.save()
      return res.json({ message: 'User updated', user })
    }

    user = await SiteUser.create({
      siteId:     site._id,
      siteDomain: site.domain,
      fullName:   fullName || '',
      username:   username || '',
      email:      email,
      password:   password || '',
      role:       'Member',
      status:     status || 'Online',
      lastLogin:  new Date(),
      loginCount: 1
    })

    res.status(201).json({ message: 'New user tracked', user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getSiteUsers = async (req, res) => {
  try {
    const { siteId } = req.query
    const filter = siteId ? { siteId } : {}

    // Auto set Offline if last login was more than 30 minutes ago
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000)
    await SiteUser.updateMany(
      { lastLogin: { $lt: thirtyMinsAgo }, status: 'Online' },
      { status: 'Offline' }
    )

    const users = await SiteUser.find(filter).sort({ lastLogin: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}