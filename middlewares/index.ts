// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const cookieParser = require('cookie-parser')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const morgan = require('morgan')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const boom = require('express-boom')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const helmet = require('helmet')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const cors = require('cors')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'passport'.
const passport = require('passport')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const swaggerUi = require('swagger-ui-express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'swaggerDoc... Remove this comment to see the full error message
const swaggerDocs = require('../docs/swaggerDefinition')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const contentTypeCheck = require('./contentTypeCheck')

// require middlewares
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('./passport')

const middleware = (app: any) => {
  // Middleware for sending error responses with express response object. To be required above all middlewares
  app.use(boom())

  // Initialise logging middleware
  app.use(morgan('combined', { stream: logger.stream }))

  // Request parsing middlewares
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  // Middleware to add security headers. Few headers have been disabled as it does not serve any purpose for the API.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      dnsPrefetchControl: false,
      ieNoOpen: false,
      referrerPolicy: false,
      xssFilter: false
    })
  )

  app.use(cors({
    origin: config.get('cors.allowedOrigins'),
    credentials: true,
    optionsSuccessStatus: 200
  }))
  app.use(contentTypeCheck)

  // Initialise authentication middleware
  app.use(passport.initialize())

  // Enable Swagger API docs in non-production environments
  // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (process.env.NODE_ENV !== 'production') {
    const options = {
      customCss: '.swagger-ui .topbar { display: none }'
    } // custom css applied to Swagger UI

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, options))
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = middleware
