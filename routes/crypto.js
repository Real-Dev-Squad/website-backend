const express = require('express')
const router = express.Router()
const cryptoController = require('../controllers/cryptoController')

/**
 * @swagger
 * /userinfo:
 *  get:
 *    summary: Get all the details of user with provided user_id
 *    tags:
 *      -users
 *    responses:
 *      200:
 *        description: User details 
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/users'
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/errors/notFound'
 *      500:
 *        description: badImplementation
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/errors/badImplementation'
 * 
 */
// router.get('/', cryptoController.userInfo)
router.get('/', cryptoController.getUser)

module.exports = router