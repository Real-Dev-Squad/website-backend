const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const { trade } = require('../controllers/tradingController')
const { newTrade } = require('../middlewares/validators/trading')

/**
 * @swagger
 * /trade:
 *  patch:
 *   summary: Used for new trading request
 *   tags:
 *     - Trading
 *   requestBody:
 *     description: Trading details
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/trading'
 *   responses:
 *     200:
 *       description: Successful trading details
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/tradingSuccess'
 *     403:
 *       description: forbidden
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/forbidden'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.patch('/:username', authenticate, newTrade, trade)

module.exports = router
