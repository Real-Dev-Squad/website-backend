// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const winston = require('winston')
// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: 'logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: 'info',
    handleExceptions: true,
    json: false,
    colorize: true,
    // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    silent: process.env.NODE_ENV === 'test' // Disable logs in test env
  }
}

// instantiate a new Winston Logger with the settings defined above
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logger'.
const logger = new winston.createLogger({ // eslint-disable-line new-cap
  /**
   * Application defaults:
   * - File logs enabled in: [production, staging]
   * - Console logs enabled in: [development]
   *
   * Modifications to be made through environment variables defined in config files
   */
  transports: [
    ...(config.get('enableFileLogs') ? [new winston.transports.File(options.file)] : []),
    ...(config.get('enableConsoleLogs') ? [new winston.transports.Console(options.console)] : [])
  ],

  exitOnError: false // do not exit on handled exceptions
})

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message: any, encoding: any) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = logger
