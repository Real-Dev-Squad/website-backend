const express = require('express')
const router = express.Router()
const contributions = require('../controllers/contributions')

/**
 * @swagger
 * /contributions/{username}:
 *   get:
 *     summary: Used to get all the contributions of user
 *     tags:
 *       - Contributions
 *     responses:
 *       200:
 *         description: Return contributions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/contributions'
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
router.get('/:username', contributions.getUserContributions)

module.exports = router
