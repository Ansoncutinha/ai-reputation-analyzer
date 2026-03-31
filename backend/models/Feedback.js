const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  siteId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  siteDomain:{ type: String },        // e.g. "example.com"

  // From the visitor who left feedback
  customerName:  { type: String, default: 'Anonymous' },
  customerEmail: { type: String },
  rating:        { type: Number, min: 1, max: 5, required: true },
  feedbackText:  { type: String, required: true },

  // Sentiment analysis result
  sentiment:     { type: String, enum: ['Positive','Neutral','Negative'], default: 'Neutral' },
  sentimentScore:{ type: Number, default: 0 },  // 0-5

  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Feedback', feedbackSchema)