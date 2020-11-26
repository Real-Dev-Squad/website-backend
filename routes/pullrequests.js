const express = require('express')
const router = express.Router()
const pullRequestController = require('../controllers/pullRequestsController.js')

router.get('/:id', pullRequestController.pullRequests)

module.exports = router
