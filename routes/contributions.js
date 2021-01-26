const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const contributionsController = require('../controllers/contributionsController')

/**
 * @swagger
 * /contributions:
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
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */
router
  .route('/:username')
  .get(authenticate, contributionsController.getUserContributions)

module.exports = router
