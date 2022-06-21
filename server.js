/**
 * Initialise globals
 */
const config = require("config");
global.config = config;

const logger = require("./utils/logger");
global.logger = logger;

logger.info(`Initialising newrelic with app name:: ${config.get("integrations.newrelic.appName")}`);
// Initialise newrelic
require("newrelic");

/**
 * Module dependencies.
 */
const http = require("http");
const app = require("./app");

/**
 * Get port from environment and store in Express.
 */

const port = config.get("port");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.error(bind + " requires elevated privileges");
      process.exit(1);
      // eslint-disable-next-line no-unreachable
      break;

    case "EADDRINUSE":
      logger.error(bind + " is already in use");
      process.exit(1);
      // eslint-disable-next-line no-unreachable
      break;

    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  logger.info(`Express API running on port:${port} with environment:${process.env.NODE_ENV}`);
}

module.exports = server;
