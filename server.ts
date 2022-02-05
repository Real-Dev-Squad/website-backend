/**
 * Initialise globals
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'global'.
global.config = config

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logger'.
const logger = require('./utils/logger')
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'global'.
global.logger = logger

/**
 * Module dependencies.
 */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const http = require('http')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('./app')

/**
 * Get port from environment and store in Express.
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'port'.
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

function onError (error: any) {
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
      // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exit(1)
      // eslint-disable-next-line no-unreachable
      break

    case 'EADDRINUSE':
      logger.error(bind + ' is already in use')
      // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exit(1)
      // eslint-disable-next-line no-unreachable
      break

    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  logger.info(`Express API running on port:${port} with environment:${process.env.NODE_ENV}`)
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = server
