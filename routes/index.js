const express = require('express')
const router = express.Router()

// import individual controllers
const healthController = require('../controllers/healthController')

// Map routes to the respective controller functions
// HealthController routes
router.get('/healthcheck', healthController.healthCheck)

module.exports = router
