const express  = require('express')
const router   = express.Router()
const { protect } = require('../middleware/auth')
const Feedback = require('../models/Feedback')
const SiteUser = require('../models/SiteUser')
const Cache    = require('../models/InsightCache')

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
    const users     = await SiteUser.find()

    const total    = feedbacks.length
    const positive = feedbacks.filter(f => f.sentiment === 'Positive').length
    const neutral  = feedbacks.filter(f => f.sentiment === 'Neutral').length
    const negative = feedbacks.filter(f => f.sentiment === 'Negative').length
    const avg      = total > 0
      ? (feedbacks.reduce((s, f) => s + (f.sentimentScore || 3), 0) / total).toFixed(2)
      : 0

    const posPercent = total > 0 ? Math.round((positive / total) * 100) : 0
    const negPercent = total > 0 ? Math.round((negative / total) * 100) : 0
    const neuPercent = total > 0 ? Math.round((neutral  / total) * 100) : 0

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

    const rawText   = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const insights  = JSON.parse(cleanText)

    await Cache.findOneAndUpdate(
      { ownerId: req.user._id },
      { ownerId: req.user._id, insights, generatedAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    )

    res.json({ insights, generatedAt: new Date(), cached: false })
  } catch (err) {
    console.error('Insights error:', err.message)
    res.status(500).json({ message: 'Failed to generate insights: ' + err.message })
  }
})

module.exports = router