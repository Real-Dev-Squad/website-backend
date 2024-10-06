/**
 * Initialise globals
 */
const config = require("config");
global.config = config;
const {fetchUserIdFromUsername, createUser, addUserToGroup} = require('./utils/aws.js')

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
  (async () => {
    try {
        const userResponse = await addUserToGroup({
            groupId: "8498a458-0021-700f-00c2-6cdad57d17f1",
            userId: "1468b498-20b1-70d9-2827-1a2ad9d99ffc",
        });
        console.log('User Response:', userResponse);
    } catch (error) {
        console.error('Failed to create user:', error);
    }
})();
logger.info(`Express API running on port:${port} with environment:${process.env.NODE_ENV}`);
}

module.exports = server;
