const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const challengesController = require('../controllers/challengeController')

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Used to get all the challenges
 *     tags:
 *       - Challenges
 *     responses:
 *       200:
 *         description: Return challenges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/challenges'
 *       404:
 *         description : No challenges found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 *   post:
 *     summary: Post new challenge
 *     tags:
 *       - Challenges
 *     responses:
 *       200:
 *         description: Post challenge
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/challenges'
 *       404:
 *         description : Unable to add challenge
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */
router
  .route('/')
  .get(authenticate, challengesController.fetchChallenges)
  .post(authenticate, challengesController.createChallenge)

/**
 * @swagger
 * /challenges/subscribe:
 *  post:
 *    summary: Subscribe user to challenge
 *    tags:
 *      - Challenges
 *    responses:
 *      200:
 *        description: Subscribed sucessfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: User has subscribed to challenge
 *      404:
 *         description : Unable to add challenge
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *      503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 *
 */
router.post('/subscribe', authenticate, challengesController.subscribeToChallenge)

module.exports = router
