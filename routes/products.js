const express = require('express')
const router = express.Router()
const productsController = require('../controllers/products')
const authenticate = require('../middlewares/authenticate')
const productsValidator = require('../middlewares/validators/crypto-products')
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Used to get all the crypto products data
 *     tags:
 *       - crypto
 *     responses:
 *       200:
 *         description: Return product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/crypto/properties/products'
 *       404:
 *         description: not found
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
router.get('/', productsController.getProducts)

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Write product data to db
 *     tags:
 *       - crypto
 *     responses:
 *       201:
 *         description: Return product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/crypto/properties/product'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       409:
 *         description: data conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/conflict'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.post('/', authenticate, productsValidator.createProduct, productsController.addNewProduct)

/**
 * @swagger
 * /products/:productid:
 *   get:
 *     summary: Used to get the crypto product data
 *     tags:
 *       - crypto
 *     responses:
 *       200:
 *         description: Return product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/crypto/properties/product'
 *       404:
 *         description: not found
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
router.get('/:productId', productsController.getProduct)

/**
 * @swagger
 * /products/purchase:
 *   post:
 *     summary: enable user to make purchase.
 *     tags:
 *       - Crypto
 *     responses:
 *       200:
 *         description: Success Message
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       402:
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
router.post('/purchase', authenticate, productsValidator.purchaseTransaction, productsController.makePurchase)

module.exports = router
