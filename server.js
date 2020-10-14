/**
 * Module dependencies.
 */
const http = require('http')
const config = require('config')
const app = require('./app')
const logger = require('./utils/logger')

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

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges')
      process.exit(1)

    case 'EADDRINUSE':
      logger.error(bind + ' is already in use')
      process.exit(1)

    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  logger.info(`Express API running on port:${port} with environment:${process.env.NODE_ENV}`)
}

module.exports = server
