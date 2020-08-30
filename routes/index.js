const express = require('express')
const app = express()

app.use('/healthcheck', require('./healthCheck.js'))
app.use('/auth', require('./auth.js'))
app.use('/user', require('./user.js'))

module.exports = app
