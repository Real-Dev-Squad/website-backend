const express = require('express')
const router = express.Router()
const miners = require('../controllers/miners.js')

/**
 * @swagger
 * /miners/list:
 *   get:
 *     summary: Get all the available miners in the system.
 *
 *     tags:
 *       - Miners
 *     responses:
 *       200:
 *         description: Miners details
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Miners returned successfully!
 *                  miners:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/miners'
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */
router.get('/list', miners.getMiners)

module.exports = router
