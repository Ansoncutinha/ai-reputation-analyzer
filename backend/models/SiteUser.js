const mongoose = require('mongoose')

const siteUserSchema = new mongoose.Schema({
  siteId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  siteDomain:{ type: String },

  // Captured from the client's website via JS snippet
  fullName:  { type: String },
  username:  { type: String },
  email:     { type: String, required: true },
  password:  { type: String },          // raw or hashed — from their site
  role:      { type: String, default: 'Member' },
  status:    { type: String, enum: ['Online','Offline'], default: 'Offline' },

  lastLogin: { type: Date, default: Date.now },
  loginCount:{ type: Number, default: 1 },
  ipAddress: { type: String },

  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('SiteUser', siteUserSchema)