const express = require('express')
const router = express.Router()
const transactions = require('../controllers/transactions.js')

/**
 * @swagger
 * /transactions/:username:
 *   get:
 *     summary: Transactions done by username in Real Dev Squad
 *     tags:
 *       - Transactions
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: User does not exist!
 *               $ref: '#/components/schemas/transactions'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:username', transactions.fetchTransactionByUsername)

module.exports = router
