const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const usersController = require('../controllers/usersController')
const userValidator = require('../middlewares/validators/user')

router.post('/', authenticate, userValidator.createUser, usersController.addNewUser)
router.patch('/:id', authenticate, userValidator.updateUser, usersController.updateUser)
router.get('/', authenticate, usersController.getUsers)
router.get('/:id', authenticate, usersController.getUser)

module.exports = router
