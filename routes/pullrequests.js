const express = require("express");
const router = express.Router();
const pullRequest = require("../controllers/pullRequests");

/**
 * @swagger
 * /pullrequests/open:
 *   get:
 *     summary: Latest 10 Pull Requests in Real Dev Squad
 *     tags:
 *       - Pull Requests
 *     parameters:
 *        - in: query
 *          name: size
 *          schema:
 *             type: integer
 *          description: Number of pull requests to be returned
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *          description: Page number for pagination
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
router.get("/open", pullRequest.getOpenPRs);

/**
 * @swagger
 * /pullrequests/stale:
 *   get:
 *     summary: All open Pull Requests in Real Dev Squad
 *     tags:
 *       - Pull Requests
 *     parameters:
 *        - in: query
 *          name: size
 *          schema:
 *             type: integer
 *          description: Number of pull requests to be returned
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *          description: Page number for pagination
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
router.get("/stale", pullRequest.getStalePRs);

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
router.get("/user/:username", pullRequest.getUserPRs);

module.exports = router;
