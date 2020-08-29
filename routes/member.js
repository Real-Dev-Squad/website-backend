const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const membersController = require('../controllers/membersController')

router.get('/', authenticate, membersController.getMembers)
router.get('/:id', authenticate, membersController.getMember)
router.post('/', authenticate, membersController.addNewMember)

module.exports = router
