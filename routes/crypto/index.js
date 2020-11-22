const express = require('express')
const app = express()

app.use('/products/', require('./products'))
app.use('/users', require('./users'))

module.exports = app
