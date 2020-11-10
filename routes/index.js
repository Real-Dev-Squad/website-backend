const express = require('express')
const app = express()

app.use('/healthcheck', require('./healthCheck.js'))
app.use('/auth', require('./auth.js'))
app.use('/users', require('./users.js'))
app.use('/members', require('./members.js'))

module.exports = app
