const express = require('express')
const router = express.Router()
const { getMembers, getIdleMembers, migrateUserRoles } = require('../controllers/members')
const authorization = require('../middlewares/authorization')
const authenticate = require('../middlewares/authenticate')
const { addRecruiter } = require('../controllers/recruiters')
const { validateRecruiter } = require('../middlewares/validators/recruiter')

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

router.get('/', getMembers)

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

router.get('/idle', getIdleMembers)

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
router.patch('/member-to-role-migration', authenticate, authorization, migrateUserRoles)

module.exports = router
