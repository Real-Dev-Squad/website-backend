const express = require('express')
const app = express()

app.use('/healthcheck', require('./healthCheck.js'))
app.use('/auth', require('./auth.js'))
app.use('/users', require('./users.js'))
app.use('/members', require('./members.js'))
app.use('/tasks', require('./tasks'))
app.use('/challenges', require('./challenges.js'))
app.use('/pullrequests', require('./pullrequests.js'))
app.use('/contributions', require('./contributions'))

module.exports = app
