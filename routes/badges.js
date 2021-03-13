const express = require('express')
const router = express.Router()
const badgeController = require('../controllers/badgeController.js')

/**
 * @swagger
 * /badges:
 *   get:
 *     summary: Get all the badges in system.
 *
 *     tags:
 *       - Badges
 *     responses:
 *       200:
 *         description: Badge details
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Badges returned successfully!
 *                  badges:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/badges'
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */
router.get('/', badgeController.getBadges)

module.exports = router
