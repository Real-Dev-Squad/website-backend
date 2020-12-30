const express = require('express')
const app = express()

app.use('/challenges/', require('./challenges'))

module.exports = app
