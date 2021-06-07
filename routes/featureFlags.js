const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const { authorizeUser } = require('../middlewares/authorization')
const { validateFeatureFlag, updateFeatureFlags } = require('../middlewares/validators/featureFlags')
const { getFeatureFlags, addFeatureFlag, updateFeatureFlag, deleteFeatureFlag } = require('../controllers/featureFlags')

/**
 * @swagger
 * /featureFlags:
 *   get:
 *     summary: Gets details of all the featureFlags
 *     tags:
 *       - FeatureFlags
 *     responses:
 *       200:
 *         description: Details of all the featureFlags
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/featureFlags'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/', getFeatureFlags)

/**
 * @swagger
 * /featureFlags:
 *   post:
 *     summary: Use to Post the details of featureFlag data.
 *
 *     requestBody:
 *       description: featureFlag data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/featureFlag'
 *
 *     tags:
 *       - FeatureFlag
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: No content
 *
 *       400:
 *         description: badRequest
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badRequest'
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */

router.post('/', authenticate, authorizeUser('appOwner'), validateFeatureFlag, addFeatureFlag)

/**
 * @swagger
 * /featureFlags/:id:
 *   patch:
 *     summary: Use to update the featureFlag data.
 *
 *     requestBody:
 *       description: featureFlag data to be updated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/featureFlag'
 *
 *     tags:
 *       - FeatureFlag
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

router.patch('/:id', authenticate, authorizeUser('appOwner'), updateFeatureFlags, updateFeatureFlag)

/**
 * @swagger
 * /featureFlags/:id:
 *   delete:
 *     summary: Use to delete the featureFlag data.
 *
 *     requestBody:
 *       description: Id of featureFlag to be deleted
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/featureFlag'
 *
 *     tags:
 *       - FeatureFlag
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: No content
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
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */

router.delete('/:id', authenticate, authorizeUser('appOwner'), deleteFeatureFlag)

module.exports = router
