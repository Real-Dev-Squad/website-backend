// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'wallet'.
const wallet = require('../controllers/wallets')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authorizeU... Remove this comment to see the full error message
const { authorizeUser } = require('../middlewares/authorization')

/**
 * @swagger
 * /wallet/:
 *   get:
 *     summary: Gets the user wallet details
 *     tags:
 *       - wallet
 *     responses:
 *       200:
 *         description: Return wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/wallet'
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/', authenticate, wallet.getOwnWallet)

/**
 * @swagger
 * /wallet/:username:
 *   get:
 *     summary: Gets the user wallet details for a username, if you are an authorized superuser
 *     tags:
 *       - wallet
 *     responses:
 *       200:
 *         description: Return wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/wallet'
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       403:
 *         description: forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/forbidden'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:username', authenticate, authorizeUser('superUser'), wallet.getUserWallet)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
