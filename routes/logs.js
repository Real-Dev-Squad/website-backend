const express = require('express')
const router = express.Router()
const logs = require('../controllers/logs')
const authenticate = require('../middlewares/authenticate')

router.get('/', authenticate, logs.getLogs)

module.exports = router
