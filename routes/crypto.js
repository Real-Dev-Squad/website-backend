const express = require('express')
const router = express.Router()
const cryptoController = require('../controllers/crypto')
const authenticate = require('../middlewares/authenticate')
const cryptoValidator = require('../middlewares/validators/crypto-products')
/**
 * @swagger
 * /crypto/products:
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
router.get('/products', cryptoController.getProducts)

/**
 * @swagger
 * /crypto/products:
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
router.post('/products', authenticate, cryptoValidator.createProduct, cryptoController.addNewProduct)

/**
 * @swagger
 * /crypto/products/{productid}:
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
router.get('/products/:productId', cryptoController.getProduct)

module.exports = router
