const express = require('express')
const router = express.Router()
const pullRequestController = require('../controllers/pullRequestsController')

/**
 * @swagger
 * /pullrequests/:id:
 *   get:
 *     summary: Gets pull requests of a user in Real Dev Squad Github organisation
 *     tags:
 *       - Pull Requests
 *     responses:
 *       200:
 *         description: Details of pull requests by a particular user in Real Dev Squad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/pullRequests'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */

router.get('/:id', pullRequestController.getPRdetails)

module.exports = router
