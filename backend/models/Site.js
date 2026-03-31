const mongoose = require('mongoose')

const siteSchema = new mongoose.Schema({
  ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'InsightUser', required: true },
  name:       { type: String, required: true },     // "My E-commerce Store"
  domain:     { type: String, required: true },     // "mystore.com"
  apiKey:     { type: String, required: true, unique: true }, // used in the JS snippet
  createdAt:  { type: Date, default: Date.now }
})

module.exports = mongoose.model('Site', siteSchema)