const express = require('express')
const router = express.Router()
const membersController = require('../controllers/membersController')

router.get('/', membersController.getMembers)

module.exports = router
