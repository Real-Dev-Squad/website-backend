const express = require('express')
const router = express.Router()
const authenticate = require('../../middlewares/authenticate')
const challengesController = require('../../controllers/roadmap-site/challengeController')

router.get('/', authenticate, challengesController.sendChallengeResponse)

module.exports = router
