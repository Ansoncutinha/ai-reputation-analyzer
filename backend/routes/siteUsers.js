const express = require('express')
const router  = express.Router()
const { trackSiteUser, getSiteUsers } = require('../controllers/siteUsersController')
const { protect } = require('../middleware/auth')

router.post('/', trackSiteUser)             // public — called by JS snippet
router.get ('/', protect, getSiteUsers)     // protected — React dashboard

module.exports = router