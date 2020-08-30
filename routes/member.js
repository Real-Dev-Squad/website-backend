const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const membersController = require('../controllers/membersController')
const memberValidator = require('../middlewares/validators/member')

router.post('/', authenticate, memberValidator.createMember, membersController.addNewMember)
router.get('/', authenticate, membersController.getMembers)
router.get('/:id', membersController.getMember)

module.exports = router
