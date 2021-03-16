const express = require('express')
const router = express.Router()
const exchangeController = require('../controllers/exchangeController')
const authenticate = require('../middlewares/authenticate')
const exchangeVaidatore = require('../middlewares/validators/exchange')

/**
 * @swagger
 * /exchange/rates:
 *   get:
 *     summary: Get exchange rate
 *     tags:
 *       - exchange
 *     responses:
 *       200:
 *         description: Return exchange
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/exchange'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/rates', exchangeController.getExchangeRate)

/**
 * @swagger
 * /exchange/rates:
 *   get:
 *     summary: post exchange rate
 *     tags:
 *       - exchange
 *     responses:
 *       201:
 *         description: Return exchange
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/exchange'
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
router.post('/rates', authenticate, exchangeVaidatore.postCurrencyRates, exchangeController.createExchangeRate)

/**
 * @swagger
 * /exchange/banks:
 *   get:
 *     summary: get all banks names
 *     tags:
 *       - exchange
 *     responses:
 *       200:
 *         description: Return bank names
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/exchange'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/banks', exchangeController.getAllBanksName)

/**
 * @swagger
 * /exchange/{bankId}::
 *   get:
 *     summary: gets currecy details form the bank
 *     tags:
 *       - exchange
 *     responses:
 *       200:
 *         description: Return exchange data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/exchange/currency'
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
router.get('/:bankId', exchangeController.getCurrencyAvailabeInBank)

/**
 * @swagger
 * /exchange/{bankId}::
 *   patch:
 *     summary: exchange currency transaction
 *     tags:
 *       - exchange
 *     responses:
 *       200:
 *         description: transaction status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/exchange'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.patch('/', authenticate, exchangeVaidatore.patchExchange, exchangeController.convertCurrency)

module.exports = router
