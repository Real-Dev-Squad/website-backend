const express = require('express')
const router = express.Router()
const members = require('../controllers/membersController')
const recruitersController = require('../controllers/recruitersController')
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

router.get('/', members.getMembers)

/**
 * @swagger
 * /members/idle:
 *   get:
 *     summary: Gets details of idle members of the Real Dev Squad
 *     tags:
 *       - Members
 *     responses:
 *       200:
 *         description: Details of inactive/idle members of the RDS members
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

router.get('/idle', members.getIdleMembers)

router.post('/intro/:username', recruitersController.addRecruiter)

module.exports = router
