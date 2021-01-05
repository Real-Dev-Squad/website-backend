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
 *       404:
 *         description : No challenges found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/challenges'
 *   post:
 *     summary: Post new challenge
 *     tags:
 *       - Challenges
 *     responses:
 *       200:
 *         description: Post challenge
 *       404:
 *         description : Not able to add challenge
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/challenges'
 */
router
  .route('/')
  .get(authenticate, challengesController.sendChallengeResponse)
  .post(authenticate, challengesController.sendChallengeResponse)

/**
 * @swagger
 * /challenges/subscribe:
 *  post:
 *    summary: Subscribe user to challenge
 *    tags:
 *      - Challenges
 *    responses:
 *      200:
 *        description: subscribed sucessfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: User has subscribed to challenge
 *      404:
 *        description : not able to suscribed to challenge
 *
 */
router.post('/subscribe', authenticate, challengesController.subscribeToChallenge)

module.exports = router
