const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const healthController = require('../controllers/healthController')

router.get('/', healthController.healthCheck)
router.get('/v2', authenticate, healthController.healthCheck)

module.exports = router
