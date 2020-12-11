const express = require('express')
const router = express.Router()
const authenticate = require('../../middlewares/authenticate')
const challengesController = require('../../controllers/roadmap-site/challengeController')
/**
 * @swagger
 * /roadmap-site/challenges/:
 *   get:
 *     summary: Use to get the challenges
 *     responses:
 *       200:
 *         description: return challenges
 *        404:
 *         description : no challenges found
 *         content:
 *           application/json:
 *  post:
 *      summary: Post new challenge
 *       responses:
 *        200:
 *          description: post challenge
 *         404:
 *          description : not able to add challenge
 *           content:
 *            application/json:
 *
 */
router
  .route('/')
  .get(authenticate, challengesController.sendChallengeResponse)
  .post(authenticate, challengesController.sendChallengeResponse)
/**
 * @swagger
 * /roadmap-site/challenges/subscribe:
 *  post:
 *      summary: Subscribe user to challenge
 *       responses:
 *        200:
 *          description: subscribed sucessfully
 *         404:
 *          description : not able to suscribed to challenge
 *           content:
 *            application/json:
 *
 */
router.post('/subscribe', authenticate, challengesController.subscribeToChallenge)

module.exports = router
