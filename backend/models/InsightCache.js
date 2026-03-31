const mongoose = require('mongoose')

const insightCacheSchema = new mongoose.Schema({
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'InsightUser', required: true, unique: true },
  insights:    { type: mongoose.Schema.Types.Mixed, required: true },
  generatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('InsightCache', insightCacheSchema)
