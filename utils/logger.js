const winston = require("winston");
// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: "info",
    filename: "logs/app.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: "info",
    handleExceptions: true,
    json: false,
    colorize: true,
    silent: process.env.NODE_ENV === "test", // Disable logs in test env
  },
};

// instantiate a new Winston Logger with the settings defined above
// eslint-disable-line new-cap
/* eslint new-cap: ["error", { "properties": false }] */
const logger = new winston.createLogger({
  /**
   * Application defaults:
   * - File logs enabled in: [production, staging]
   * - Console logs enabled in: [development]
   *
   * Modifications to be made through environment variables defined in config files
   */
  transports: [
    ...(config.get("enableFileLogs") ? [new winston.transports.File(options.file)] : []),
    ...(config.get("enableConsoleLogs") ? [new winston.transports.Console(options.console)] : []),
  ],

  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
