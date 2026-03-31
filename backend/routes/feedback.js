const express = require('express')
const router  = express.Router()
const { submitFeedback, getFeedback } = require('../controllers/feedbackController')
const { protect } = require('../middleware/auth')

router.post('/',  submitFeedback)          // public — called by JS snippet
router.get ('/',  protect, getFeedback)    // protected — React dashboard

module.exports = router