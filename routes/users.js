const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const usersController = require('../controllers/usersController')
const userValidator = require('../middlewares/validators/user')

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
router.get('/:id', authenticate, usersController.getUser)

module.exports = router
