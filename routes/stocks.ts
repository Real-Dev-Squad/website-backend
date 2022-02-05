// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authorizeU... Remove this comment to see the full error message
const { authorizeUser } = require('../middlewares/authorization')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addNewStoc... Remove this comment to see the full error message
const { addNewStock, fetchStocks, getSelfStocks } = require('../controllers/stocks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createStoc... Remove this comment to see the full error message
const { createStock } = require('../middlewares/validators/stocks')

/**
 * @swagger
 * /stocks:
 *  get:
 *   summary: Used to get all the stocks
 *   tags:
 *     - Stocks
 *   responses:
 *     200:
 *       description: returns stocks
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/stocks'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */

router.get('/', fetchStocks)

/**
 * @swagger
 * /stocks:
 *  post:
 *   summary: Used to create new stock
 *   tags:
 *     - Stocks
 *   requestBody:
 *     description: Stock data
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/stocks'
 *   responses:
 *     200:
 *       description: returns newly created stock
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/stocks'
 *     401:
 *       description: unAuthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/unAuthorized'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.post('/', authenticate, authorizeUser('superUser'), createStock, addNewStock)

/**
 * @swagger
 * /stocks/user/self:
 *  get:
 *   summary: Used to get all the stocks of the user
 *   tags:
 *     - User Stocks
 *   responses:
 *     200:
 *       description: returns stocks of the user
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userStocks'
 *     401:
 *       description: unAuthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/unAuthorized'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */

router.get('/user/self', authenticate, getSelfStocks)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
