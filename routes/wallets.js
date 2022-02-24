const express = require("express");
const router = express.Router();
const wallet = require("../controllers/wallets");
const { authenticate } = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");

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
router.get("/", authenticate, wallet.getOwnWallet);

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
router.get("/:username", authenticate, authorizeUser("superUser"), wallet.getUserWallet);

module.exports = router;
