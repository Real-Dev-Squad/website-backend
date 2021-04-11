const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const authorization = require('../middlewares/authorization')
const { addNewStock, fetchStocks, getUserStocks } = require('../controllers/stocks')
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
router.post('/', authenticate, authorization, createStock, addNewStock)

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
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */

router.get('/user/self', authenticate, getUserStocks)

module.exports = router
