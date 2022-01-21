/**
 * Initialise globals
 */
import config from 'config'

import logger from './utils/logger'

/**
 * Module dependencies.
 */
import http from 'http'
import app from './app'

// @ts-ignore
// global.config = config
// global.logger = logger

/**
 * Get port from environment and store in Express.
 */

const port = config.get('port')
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

// @ts-ignore

/**
 * Event listener for HTTP server 'error' event.
 */

// @ts-ignore
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges')
      process.exit(1)
      // @ts-ignore
      // eslint-disable-next-line no-unreachable
      break

    case 'EADDRINUSE':
      logger.error(bind + ' is already in use')
      process.exit(1)
      // @ts-ignore
      // eslint-disable-next-line no-unreachable
      break

    default:
      throw error
  }
}

/**
 * Event listener for HTTP server 'listening' event.
 */

function onListening () {
  logger.info(`Express API running on port:${port} with environment:${process.env.NODE_ENV}`)
}

module.exports = server
