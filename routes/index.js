const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

// import individual controllers
const healthController = require('../controllers/healthController');
const authController = require('../controllers/authController');
const membersController = require('../controllers/membersController');

// Map routes to the respective controller functions

// HealthController routes

/**
 * @swagger
 * /healthcheck:
 *    get:
 *      summary: Use to check health status of the server.
 *      tags:
 *        - Healthcheck
 *      responses:
 *          200:
 *             description: Server uptime status
 *             content:
 *                application/json:
 *                   schema:
 *                      $ref: '#/components/schemas/healthcheck'
 */
router.get('/healthcheck', healthController.healthCheck);

/**
 * @swagger
 * /healthcheckv2:
 *    get:
 *      summary: Sample route to test authenticated middleware.
 *      tags:
 *        - Healthcheck
 *      security:
 *        - cookieAuth: []
 *      responses:
 *          200:
 *             description: Server uptime status
 *             content:
 *               application/json:
 *                  schema:
 *                     $ref: '#/components/schemas/healthcheck'
 *          401:
 *             description: Unauthorized
 */
router.get('/healthcheckv2', authenticate, healthController.healthCheck);

// AuthController routes
router.get('/auth/github/callback', authController.githubAuth);

router.get('/members', membersController.getMembers);

module.exports = router;
