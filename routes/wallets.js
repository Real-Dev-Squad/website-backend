const express = require('express')
const router = express.Router()
const walletController = require('../controllers/walletsController')
const authenticate = require('../middlewares/authenticate')

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
router.get('/', authenticate, walletController.getUserWallet)

module.exports = router
