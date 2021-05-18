const express = require('express')
const router = express.Router()
const members = require('../controllers/members')
const { addRecruiter } = require('../controllers/recruiters')
const { validateRecruiter } = require('../middlewares/validators/recruiter')
const authenticate = require('../middlewares/authenticate')
const { authorizeUser } = require('../middlewares/authorization')
const { ROLES } = require('../constants/roles')

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

/**
 * @swagger
 * /members/intro/:username:
 *   post:
 *     summary: Posts details of the recruiter
 *     tags:
 *       - Members
 *     responses:
 *       200:
 *         description: Details of the recruiter and the member in which recruiter is interested
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/recruiters'
 *
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *
 *       500:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */

router.post('/intro/:username', validateRecruiter, addRecruiter)

/**
 * @swagger
 * /moveToMembers/:username:
 *   patch:
 *     summary: Changes the role of a new member(the username provided in params) to member
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Success Message
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User successfully made a member
 *       400:
 *         description: badRequest
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User Already is a member
 *
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *
 *       500:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */

router.patch('/moveToMembers/:username', authenticate, authorizeUser(ROLES.SUPERUSER), members.moveToMembers)

module.exports = router
