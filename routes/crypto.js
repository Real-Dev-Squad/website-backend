const express = require('express')
const router = express.Router()
const cryptoController = require('../controllers/crypto')

/**
 * @swagger
 * /crypto/product:
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

module.exports = router
