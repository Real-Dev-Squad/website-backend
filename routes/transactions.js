const express = require('express')
const router = express.Router()
const transactionsController = require('../controllers/transactionsController.js')

/**
 * @swagger
 * /transactions/fetchLatest/:username:
 *   get:
 *     summary: Transactions done by username in Real Dev Squad
 *     tags:
 *       - Transaction Management
 *     responses:
 *       200:
 *         description: Transaction Management
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Transactions returned successfully!
 *                  transactions:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/transactions'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/fetchLatest/:username/:noOfRecords', transactionsController.fetchLatest)

module.exports = router
