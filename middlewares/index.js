const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const boom = require('express-boom')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('../utils/swaggerDefinition')
const contentTypeCheck = require('./contentTypeCheck')
const config = require('config')

// import utilities
const logger = require('../utils/logger')

// require middlewares
require('./passport')

const middleware = (app) => {
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
  if (process.env.NODE_ENV !== 'production') {
    const options = {
      customCss: '.swagger-ui .topbar { display: none }'
    } // custom css applied to Swagger UI

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, options))
  }
}

module.exports = middleware
