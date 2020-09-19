const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

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
router.get('/github/callback', authController.githubAuth)

module.exports = router
