const express = require('express')
const router = express.Router()
const miners = require('../controllers/miners.js')

router.get('/list', miners.getMiners)

module.exports = router
