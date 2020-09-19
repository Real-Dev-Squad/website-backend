const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const healthController = require('../controllers/healthController')

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Use to check health status of the server.
 *     tags:
 *       - Healthcheck
 *     responses:
 *       200:
 *         description: Server uptime status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/healthCheck'
 */
router.get('/', healthController.healthCheck)

/**
 * @swagger
 * /healthcheck/v2:
 *   get:
 *     summary: Sample route to test authentication middleware.
 *     tags:
 *       - Healthcheck
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Server uptime status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/healthCheck'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 */
router.get('/v2', authenticate, healthController.healthCheck)

module.exports = router
