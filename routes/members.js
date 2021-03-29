const express = require('express')
const router = express.Router()
const membersController = require('../controllers/membersController')
const authenticate = require('../middlewares/authenticate')

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Gets details of all the Real Dev Squad members
 *     tags:
 *       - Members
 *     responses:
 *       200:
 *         description: Details of all the RDS members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */

router.get('/', membersController.getMembers)

router.post('/cache/clear/self', authenticate, membersController.purgeMembersCache)

module.exports = router
