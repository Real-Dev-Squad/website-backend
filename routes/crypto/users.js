const express = require('express')
const router = express.Router()
const authenticate = require('../../middlewares/authenticate')
const usersController = require('../../controllers/crypto/usersController')

/**
 * @swagger
 * /crypto/users/:id:
 *   put:
 *     summary: put user details to crypto Db
 *     tags:
 *       - Crypto
 *     parameters:
 *       - in: parmas
 *         data: id
 *     responses:
 *       201:
 *         description: User added successfully
 *       409:
 *         description: User doesn't exist
 *       401:
 *         description: Unauthorized
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
router.put('/:id', authenticate, usersController.addNewUser)

/**
 * @swagger
 * /crypto/users/:id/transactionHistory:
 *   patch:
 *     summary: update user transaction history to crypto Db
 *     tags:
 *       - Crypto
 *     parameters:
 *       - in: parmas, body
 *         data: id, dataObject
 *     responses:
 *       201:
 *         description: User added successfully
 *       409:
 *         description: User doesn't exist
 *       401:
 *         description: Unauthorized
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
router.patch('/:id/transactionHistory', authenticate, usersController.updateTransactionHistory)

/**
 * @swagger
 * /crypto/users/:id/shoppingHistory:
 *   patch:
 *     summary: update user shopping history to crypto Db
 *     tags:
 *       - Crypto
 *     parameters:
 *       - in: parmas, body
 *         data: id, dataObject
 *     responses:
 *       201:
 *         description: User added successfully
 *       409:
 *         description: User doesn't exist
 *       401:
 *         description: Unauthorized
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
router.patch('/:id/shoppingHistory', authenticate, usersController.updateShoppingHistory)

/**
 * @swagger
 * /crypto/users/:id/cart:
 *   patch:
 *     summary: update user shoping cart to crypto Db
 *     tags:
 *       - Crypto
 *     parameters:
 *       - in: parmas, body
 *         data: id, dataObject
 *     responses:
 *       201:
 *         description: User added successfully
 *       409:
 *         description: User doesn't exist
 *       401:
 *         description: Unauthorized
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
router.patch('/:id/cart', authenticate, usersController.updateCart)

/**
 * @swagger
 * /crypto/users/:id/send:
 *   patch:
 *     summary: Sends coins to user
 *     tags:
 *       - Crypto
 *     parameters:
 *       - in: parmas, body
 *         data: id, dataObject
 *     responses:
 *       201:
 *         description: User added successfully
 *       409:
 *         description: User doesn't exist
 *       401:
 *         description: Unauthorized
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
router.patch('/:id/send', authenticate, usersController.sendCoins)

/**
 * @swagger
 * /crypto/users/:id/receive:
 *   patch:
 *     summary: Request for coins to user
 *     tags:
 *       - Crypto
 *     parameters:
 *       - in: parmas, body
 *         data: id, dataObject
 *     responses:
 *       201:
 *         description: User added successfully
 *       409:
 *         description: User doesn't exist
 *       401:
 *         description: Unauthorized
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
router.patch('/:id/receive', authenticate, usersController.receiveCoins)

/**
 * @swagger
 * /crypto/users/:id:
 *   get:
 *     summary: Get user from crypto site
 *     tags:
 *       - Crypto
 *     parameters:
 *       - in: parmas
 *         data: id
 *     responses:
 *       200:
 *         description: User returned successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
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
router.get('/:id', authenticate, usersController.getUser)

module.exports = router
