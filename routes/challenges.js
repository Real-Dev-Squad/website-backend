const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const challengesController = require('../controllers/challengeController')

/**
 * @swagger
 * /challenges/:
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
 *           application/json
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
 *           application/json
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
 *      404:
 *        description : not able to suscribed to challenge
 *        content:
 *          application/json
 */

router.post('/subscribe', authenticate, challengesController.subscribeToChallenge)

module.exports = router
