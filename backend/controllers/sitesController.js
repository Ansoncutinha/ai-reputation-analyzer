const Site   = require('../models/Site')
const crypto = require('crypto')

// GET /api/sites — get all sites for logged-in user
const getMySites = async (req, res) => {
  try {
    const sites = await Site.find({ ownerId: req.user._id })
    res.json(sites)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/sites — register a new client website
const createSite = async (req, res) => {
  try {
    const { name, domain } = req.body
    const apiKey = crypto.randomBytes(20).toString('hex')  // unique API key
    const site = await Site.create({
      ownerId: req.user._id,
      name, domain, apiKey
    })
    res.status(201).json(site)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/sites/:id
const deleteSite = async (req, res) => {
  try {
    await Site.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id })
    res.json({ message: 'Site removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getMySites, createSite, deleteSite }