const express = require('express');
const router = express.Router();

// import individual controllers
const healthController = require('../controllers/healthController');
const authController = require('../controllers/authController');
const membersController = require('../controllers/membersController');

// Map routes to the respective controller functions
// HealthController routes
router.get('/healthcheck', healthController.healthCheck);

// AuthController routes
router.get('/auth/github/callback', authController.githubAuth);

router.get('/members', membersController.getMembers);

module.exports = router;
