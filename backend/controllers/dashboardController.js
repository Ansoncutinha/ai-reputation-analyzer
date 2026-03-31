const Feedback = require('../models/Feedback')
const SiteUser = require('../models/SiteUser')

// GET /api/dashboard?siteId=xxx
const getDashboard = async (req, res) => {
  try {
    const { siteId } = req.query
    const filter = siteId ? { siteId } : {}

    const totalFeedback = await Feedback.countDocuments(filter)
    const totalUsers    = await SiteUser.countDocuments(siteId ? { siteId } : {})

    // Sentiment breakdown
    const positive = await Feedback.countDocuments({ ...filter, sentiment: 'Positive' })
    const negative = await Feedback.countDocuments({ ...filter, sentiment: 'Negative' })
    const neutral  = await Feedback.countDocuments({ ...filter, sentiment: 'Neutral'  })

    // Average sentiment score
    const avgResult = await Feedback.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: '$sentimentScore' } } }
    ])
    const avgScore = avgResult[0]?.avg?.toFixed(2) || 0

    // Sentiment over time (last 30 days grouped by date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const timeline = await Feedback.aggregate([
      { $match: { ...filter, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: {
            date:      { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sentiment: '$sentiment'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])

    res.json({
      totalFeedback,
      totalUsers,
      sentimentBreakdown: {
        positive,
        negative,
        neutral,
        positivePercent: totalFeedback ? Math.round(positive/totalFeedback*100) : 0,
        negativePercent: totalFeedback ? Math.round(negative/totalFeedback*100) : 0,
        neutralPercent:  totalFeedback ? Math.round(neutral /totalFeedback*100) : 0,
      },
      avgSentimentScore: Number(avgScore),
      timeline
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getDashboard }