import { createLogger, transports as _transports } from 'winston'
import config from 'config'
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
    silent: process.env.NODE_ENV === 'test' // Disable logs in test env
  }
}

// instantiate a new Winston Logger with the settings defined above
// @ts-ignore
const logger = new createLogger({ // eslint-disable-line new-cap
  /**
   * Application defaults:
   * - File logs enabled in: [production, staging]
   * - Console logs enabled in: [development]
   *
   * Modifications to be made through environment variables defined in config files
   */
  transports: [
    ...(config.get('enableFileLogs') ? [new _transports.File(options.file)] : []),
    ...(config.get('enableConsoleLogs') ? [new _transports.Console(options.console)] : [])
  ],

  exitOnError: false // do not exit on handled exceptions
})

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  // @ts-ignore
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message)
  }
}

export default logger
