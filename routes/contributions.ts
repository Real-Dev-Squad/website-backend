// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const contributions = require('../controllers/contributions')

/**
 * @swagger
 * /contributions/{username}:
 *   get:
 *     summary: Used to get all the contributions of user
 *     tags:
 *       - Contributions
 *     responses:
 *       200:
 *         description: Return contributions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/contributions'
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:username', contributions.getUserContributions)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
