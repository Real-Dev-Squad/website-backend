const express = require('express')
const router = express.Router()
const membersController = require('../controllers/membersController')

router.get('/', membersController.getMembers)

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
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */

module.exports = router
