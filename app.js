const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const boom = require('express-boom')
const helmet = require('helmet')
const cors = require('cors')

// import routes
const indexRouter = require('./routes/index')

const app = express()

app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(helmet())
app.use(cors())
app.use(boom())

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.boom.badRequest('Invalid request')
})

module.exports = app
