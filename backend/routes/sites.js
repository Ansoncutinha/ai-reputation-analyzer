const express = require('express')
const router  = express.Router()
const { getMySites, createSite, deleteSite } = require('../controllers/sitesController')
const { protect } = require('../middleware/auth')

router.get   ('/',     protect, getMySites)
router.post  ('/',     protect, createSite)
router.delete('/:id',  protect, deleteSite)

module.exports = router