const express = require('express')
const router = express.Router()
const members = require('../controllers/members')
const { authorizeUser } = require('../middlewares/authorization')
const authenticate = require('../middlewares/authenticate')
const { addRecruiter, fetchRecruitersInfo } = require('../controllers/recruiters')
const { validateRecruiter } = require('../middlewares/validators/recruiter')
const { SUPER_USER } = require('../constants/roles')

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
 * /members/intro:
 *   get:
 *     summary: Returns all requests for member introduction by recruiter in the system.
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Details of the recruiter and the member in which recruiter is interested
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/recruiters'
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

router.get('/intro', authenticate, authorizeUser(SUPER_USER), fetchRecruitersInfo)

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
 *         description: no content
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

router.patch('/moveToMembers/:username', authenticate, authorizeUser(SUPER_USER), members.moveToMembers)
/**
 * @swagger
 * /members/member-to-role-migration:
 *  patch:
 *   summary: One time call to update roles of the users
 *   tags:
 *     - Members
 *   responses:
 *     200:
 *       description: Details of the users migrated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/migratedUsers'
 *     401:
 *       description: unAuthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/unAuthorized'
 *     403:
 *       description: forbidden
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/forbidden'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.patch('/member-to-role-migration', authenticate, authorizeUser('superUser'), members.migrateUserRoles)

/**
 * @swagger
 * /members/delete-isMember:
 *  patch:
 *   summary: One time call to remove isMember field for all the migrated users
 *   tags:
 *     - Members
 *   responses:
 *     200:
 *       description: Details of the users migrated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/migratedUsers'
 *     401:
 *       description: unAuthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/unAuthorized'
 *     403:
 *       description: forbidden
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/forbidden'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.patch('/delete-isMember', authenticate, authorizeUser('superUser'), members.deleteIsMember)

/**
 * @swagger
 * /archiveMembers/:username:
 *   patch:
 *     summary: Changes the role of a old member(the username provided in params) in new members list to archive_member
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: no content
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

router.patch('/archiveMembers/:username', authenticate, authorizeUser(SUPER_USER), members.archiveMembers)

module.exports = router
