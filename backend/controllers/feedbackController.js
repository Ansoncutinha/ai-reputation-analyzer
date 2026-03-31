const Feedback = require('../models/Feedback')
const Site     = require('../models/Site')

const analyzeSentiment = (text, starRating) => {
  const t = text.toLowerCase()

  const positiveWords = [
    'great','excellent','love','amazing','good','best','fantastic',
    'wonderful','perfect','awesome','helpful','easy','fast','superb',
    'outstanding','brilliant','impressive','beautiful','nice','happy',
    'satisfied','recommend','worth','quality','smooth','clean'
  ]
  const negativeWords = [
    'bad','poor','terrible','worst','hate','slow','broken','difficult',
    'useless','awful','disappointing','frustrating','not great','costly',
    'expensive','waste','horrible','ugly','sad','unhappy','regret',
    'problem','issue','wrong','fake','cheap','damaged','late','never'
  ]

  let textScore = 0
  positiveWords.forEach(w => { if (t.includes(w)) textScore++ })
  negativeWords.forEach(w => { if (t.includes(w)) textScore-- })

  // Star rating is the PRIMARY factor
  // Text analysis is secondary (small adjustment)
  let finalScore = starRating

  // Small text adjustment (max +0.5 or -0.5)
  if (textScore > 0) finalScore = Math.min(5, finalScore + 0.3)
  if (textScore < 0) finalScore = Math.max(1, finalScore - 0.3)

  // Round to 1 decimal
  finalScore = Math.round(finalScore * 10) / 10

  // Determine sentiment based on star rating (not text)
  let sentiment
  if (starRating >= 4)      sentiment = 'Positive'
  else if (starRating <= 2) sentiment = 'Negative'
  else                      sentiment = 'Neutral'   // exactly 3 stars

  return { sentiment, sentimentScore: finalScore }
}

// POST /api/feedback — called by ShopZone backend
exports.submitFeedback = async (req, res) => {
  try {
    const { apiKey, customerName, customerEmail, rating, feedbackText } = req.body

    // Validate required fields
    if (!apiKey)       return res.status(400).json({ message: 'API key required' })
    if (!rating)       return res.status(400).json({ message: 'Rating required' })
    if (!feedbackText) return res.status(400).json({ message: 'Feedback text required' })

    // Find site by API key
    const site = await Site.findOne({ apiKey })
    if (!site) return res.status(404).json({ message: 'Invalid API key — check your .env file' })

    // Analyze sentiment using star rating + text
    const { sentiment, sentimentScore } = analyzeSentiment(feedbackText, Number(rating))

    // Save to database
    const feedback = await Feedback.create({
      siteId:         site._id,
      siteDomain:     site.domain,
      customerName:   customerName || 'Anonymous',
      customerEmail:  customerEmail || '',
      rating:         Number(rating),
      feedbackText:   feedbackText,
      sentiment:      sentiment,
      sentimentScore: sentimentScore
    })

    console.log(`✅ Feedback saved: ${rating} stars → ${sentiment} (score: ${sentimentScore})`)

    res.status(201).json({
      message:  'Feedback recorded successfully',
      feedback: feedback
    })
  } catch (err) {
    console.error('❌ Feedback error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

// GET /api/feedback — used by InsightFlow dashboard
exports.getFeedback = async (req, res) => {
  try {
    const { siteId, sentiment, page = 1, limit = 50 } = req.query

    // Build filter
    const filter = {}
    if (siteId)    filter.siteId    = siteId
    if (sentiment) filter.sentiment = sentiment

    // Count total
    const total = await Feedback.countDocuments(filter)

    // Get feedback sorted by newest first
    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    res.json({
      feedbacks: feedbacks,
      total:     total,
      page:      Number(page)
    })
  } catch (err) {
    console.error('❌ Get feedback error:', err.message)
    res.status(500).json({ message: err.message })
  }
}
