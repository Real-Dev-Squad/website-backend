const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const boom = require('express-boom')
const helmet = require('helmet')
const cors = require('cors')

// import utilities
const logger = require('../utils/logger')

const middleware = function (app) {
  app.use(morgan('combined', { stream: logger.stream }))

  // Request parsing middlewares
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  app.use(helmet())

  app.use(cors({
    optionsSuccessStatus: 200
  }))

  app.use(boom())
}

module.exports = middleware
