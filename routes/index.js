const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')

// import individual controllers
const healthController = require('../controllers/healthController')
const authController = require('../controllers/authController')
const membersController = require('../controllers/membersController')

// Map routes to the respective controller functions
// HealthController routes
router.get('/healthcheck', healthController.healthCheck)

// sample route to test authenticated middleware
router.get('/healthcheckv2', authenticate, healthController.healthCheck)

// AuthController routes
router.get('/auth/github/callback', authController.githubAuth)

router.get('/members', membersController.getMembers)

module.exports = router
