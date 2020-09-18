const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const healthController = require('../controllers/healthController')

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
router.get('/', healthController.healthCheck)

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
router.get('/v2', authenticate, healthController.healthCheck)

module.exports = router
