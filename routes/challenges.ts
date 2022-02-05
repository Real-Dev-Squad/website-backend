// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const challenges = require('../controllers/challenge')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createChal... Remove this comment to see the full error message
const { createChallenge } = require('../middlewares/validators/challenges')

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
 */
router.get('/', authenticate, challenges.fetchChallenges)

/**
 * @swagger
 * /challenges:
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
router.post('/', authenticate, createChallenge, challenges.createChallenge)

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
 */
router.post('/subscribe', authenticate, challenges.subscribeToChallenge)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
