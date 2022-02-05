// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const health = require('../controllers/health')

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
router.get('/', health.healthCheck)

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
router.get('/v2', authenticate, health.healthCheck)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
