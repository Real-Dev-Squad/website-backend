// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const badge = require('../controllers/badge.js')

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
 * /badges/:username:
 *   get:
 *     summary: Get all the badges of a particular user.
 *
 *     tags:
 *       - Badges
 *     responses:
 *       200:
 *         description: User badegs
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User badges returned successfully!
 *                  userBadges:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/userBadges'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */

router.get('/:username', badge.getUserBadges)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
