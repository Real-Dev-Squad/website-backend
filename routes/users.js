const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const usersController = require('../controllers/usersController')
const userValidator = require('../middlewares/validators/user')

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user with provided data.
 *
 *     requestBody:
 *       description: User data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/users'
 *
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users'
 *
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       403:
 *         description: forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/forbidden'
 *       404:
 *         description: notFound
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
router.post('/', authenticate, userValidator.createUser, usersController.addNewUser)

/**
 * @swagger
 * /users/self:
 *   patch:
 *     summary: Use to update the user data.
 *
 *     requestBody:
 *       description: User data to be updated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/users'
 *
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: No content
 *
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       403:
 *         description: forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/forbidden'
 *       404:
 *         description: notFound
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
router.patch('/self', authenticate, userValidator.updateUser, usersController.updateSelf)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all the users in system.
 *
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Users returned successfully!
 *                  users:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/users'
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       403:
 *         description: forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/forbidden'
 *       404:
 *         description: notFound
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
router.get('/', authenticate, usersController.getUsers)

/**
 * @swagger
 * /users/self:
 *   get:
 *     summary: Use to get self details.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users'
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
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/self', authenticate, usersController.getSelfDetails)

/**
 * @swagger
 * /users/:username:
 *   get:
 *     summary: Get the details of user with provided id.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users'
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
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:username', authenticate, usersController.getUser)

module.exports = router
