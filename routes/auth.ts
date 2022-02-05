// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const auth = require('../controllers/auth')

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: Authenticates the user using the GitHub Oauth 2.0. Redirects to the UI on successful login
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         type: string
 *         description: Temporary code returned by GitHub Oauth
 *     responses:
 *       302:
 *         description: Redirects to the UI on successful login
 *         headers:
 *           Cookie:
 *             type: string
 *             description: Cookie containing authentication token
 *           Location:
 *             type: string
 *             description: Redirection URL
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 */
router.get('/github/callback', auth.githubAuth)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
