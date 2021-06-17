const express = require('express')
const router = express.Router()
const urlShortner = require('../controllers/urlShortner')
const authenticate = require('../middlewares/authenticate')

/**
 * @swagger
 * /urlShorten:
 *   get:
 *     summary: fetch unique long url
 *     tags:
 *       - Url Shortner
 *     responses:
 *       200:
 *         description: fetch long url
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: url
 *                  urlShortner:
 *                    type: objects
 *                    items:
 *                      $ref: '#/components/schemas/urlShortner'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:shortUrl', urlShortner.getLongUrl)

/**
 * @swagger
 * /urlShorten:
 *   get:
 *     summary: fetch shortned url
 *     tags:
 *       - Url Shortner
 *     responses:
 *       200:
 *         description: fetch shortned url
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: url
 *                  urlShortner:
 *                    type: objects
 *                    items:
 *                      $ref: '#/components/schemas/urlShortner'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.post('/', authenticate, urlShortner.postUrlData)

module.exports = router
