// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authorizeU... Remove this comment to see the full error message
const { authorizeUser } = require('../middlewares/authorization')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'validateFe... Remove this comment to see the full error message
const { validateFeatureFlag, updateFeatureFlags } = require('../middlewares/validators/featureFlags')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'featureFla... Remove this comment to see the full error message
const featureFlag = require('../controllers/featureFlags')

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
router.get('/', featureFlag.getFeatureFlags)

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

router.post('/', authenticate, authorizeUser('appOwner'), validateFeatureFlag, featureFlag.addFeatureFlag)

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

router.patch('/:id', authenticate, authorizeUser('appOwner'), updateFeatureFlags, featureFlag.updateFeatureFlag)

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

router.delete('/:id', authenticate, authorizeUser('appOwner'), featureFlag.deleteFeatureFlag)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
