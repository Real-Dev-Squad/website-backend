const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const users = require('../controllers/users')
const userValidator = require('../middlewares/validators/user')
const { upload } = require('../utils/multer')

router.post('/users/verify', authenticate, users.verifyUser)

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
router.patch('/self', authenticate, userValidator.updateUser, users.updateSelf)

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
router.get('/', authenticate, users.getUsers)

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
router.get('/self', authenticate, users.getSelfDetails)

/**
 * @swagger
 * /users/isUsernameAvailable/:username:
 *   get:
 *     summary: check user exists or not
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User Availability
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/userAvailable'
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
router.get('/isUsernameAvailable/:username', authenticate, users.getUsernameAvailabilty)

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
router.get('/:username', users.getUser)

/**
 * @swagger
 * /users/picture:
 *   post:
 *     summary: Post user profile picture
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: profile
 *         type: file
 *         description: Profile picture to upload
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users/img'
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
 *       413:
 *         description: entityTooLarge
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/entityTooLarge'
 *       415:
 *         description: unsupportedMediaType
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unsupportedMediaType'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
// upload.single('profile') -> multer inmemory storage of file for type multipart/form-data
router.post('/picture', authenticate, upload.single('profile'), users.postUserPicture)

router.patch('/identityURL', authenticate, userValidator.updateIdentityURL, users.identityURL)

module.exports = router
