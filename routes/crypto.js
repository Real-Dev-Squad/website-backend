const express = require('express')
const router = express.Router()
const cryptoController = require('../controllers/cryptoController')
const { send, receive, approve } = require('../middlewares/validators/cryptoReqValidator')
/**
 * @swagger
 * /members:
 *   get:
 *     summary: send Money from one user to other
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

router.post('/send', send, cryptoController.send)

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Raise a request to get money from named user
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

router.post('/request', receive, cryptoController.request)

/**
 * @swagger
 * /members:
 *   get:
 *     summary: once money request is accepted by user then for transferring money this api could be used
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

router.post('/approvedRequest', approve, cryptoController.approved)

module.exports = router
