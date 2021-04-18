const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const { trade } = require('../controllers/trading')
const { newTrade } = require('../middlewares/validators/trading')

/**
 * @swagger
 * /trade/stock/new/self:
 *  post:
 *   summary: Used for new trading request
 *   tags:
 *     - Trading
 *   security:
 *     - bearerAuth: []
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
 *     401:
 *       description: unAuthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/unAuthorized'
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
router.post('/stock/new/self', authenticate, newTrade, trade)

module.exports = router
