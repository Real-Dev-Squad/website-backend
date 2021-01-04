const express = require('express')
const router = express.Router()
const pullRequestController = require('../controllers/pullRequestsController')

/**
 * @swagger
 * /pullrequests/open:
 *   get:
 *     summary: Latest 10 Pull Requests in Real Dev Squad
 *     tags:
 *       - Pull Requests
 *     responses:
 *       200:
 *         description: Pull Requests
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Open PRs
 *                  pullRequests:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/pullRequests'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/open', pullRequestController.getOpenPRs)

/**
 * @swagger
 * /pullrequests/stale:
 *   get:
 *     summary: All open Pull Requests in Real Dev Squad
 *     tags:
 *       - Pull Requests
 *     responses:
 *       200:
 *         description: Pull Requests
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Stale PRs
 *                  pullRequests:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/pullRequests'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/stale', pullRequestController.getStalePRs)

/**
 * @swagger
 * /pullrequests/user/:username:
 *   get:
 *     summary: Pull Requests by a user in Real Dev Squad
 *     tags:
 *       - Pull Requests
 *     responses:
 *       200:
 *         description: Pull Requests
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Pull requests returned successfully!
 *                  pullRequests:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/pullRequests'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */

router.get('/user/:username', pullRequestController.getUserPRs)

module.exports = router
