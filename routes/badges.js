const express = require('express')
const router = express.Router()
const badge = require('../controllers/badge.js')
const authenticate = require('../middlewares/authenticate')

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

router.get('/', badge.getBadges)

/**
 * @swagger
 * /badges:
 *   patch:
 *     summary: Use to update the badge data.
 *
 *     requestBody:
 *       description: badge data to be updated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/badges'
 *
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: No content
 *
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

router.put('/', authenticate, badge.createBadges)

/**
 * @swagger
 * /badges:
 *   patch:
 *     summary: Use to update the badge data.
 *
 *     requestBody:
 *       description: badge data to be updated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/badges'
 *
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: No content
 *
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

router.patch('/', authenticate, badge.updateBadges)

module.exports = router
