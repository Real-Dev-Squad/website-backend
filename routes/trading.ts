// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'trade'.
const { trade } = require('../controllers/trading')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'newTrade'.
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
