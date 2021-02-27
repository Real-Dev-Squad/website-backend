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
 *               $ref: '#/components/schemas/crypto'
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
 *               $ref: '#/components/schemas/crypto'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.post('/products', authenticate, cryptoValidator.createProduct, cryptoController.addNewProduct)

module.exports = router
