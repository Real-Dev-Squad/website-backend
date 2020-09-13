const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.get('/github/callback', authController.githubAuth)

module.exports = router
