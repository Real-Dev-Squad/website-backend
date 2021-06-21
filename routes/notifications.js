const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const notifications = require('../controllers/notifications')

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all the notifications  for current logged in user in system.
 *
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications details
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    example: Notifications returned successfully!
 *                    data:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/notifications'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badRequest'
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */

router.get('/', authenticate, notifications.getNotificationsForUser)

module.exports = router
