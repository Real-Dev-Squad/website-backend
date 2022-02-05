// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const createError = require('http-errors')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isMulterEr... Remove this comment to see the full error message
const { isMulterError, multerErrorHandling } = require('./utils/multer')

// Attach response headers
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const responseHeaders = require('./middlewares/responseHeaders')

// import app middlewares
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'AppMiddlew... Remove this comment to see the full error message
const AppMiddlewares = require('./middlewares')

// import routes
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const indexRouter = require('./routes/index')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = express()

// Add Middlewares, routes
AppMiddlewares(app)
app.use('/', responseHeaders, indexRouter)

// catch 404 and forward to error handler
app.use(function (req: any, res: any, next: any) {
  next(createError(404))
})

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  if (isMulterError(err)) {
    multerErrorHandling(err, req, res)
  } else {
    res.boom.notFound(err)
  }
})

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = app
