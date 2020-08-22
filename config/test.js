const setBooleanConfig = require('../utils/config').setBooleanConfig
const port = process.env.PORT || 3000

module.exports = {
  port: port,
  enableFileLogs: setBooleanConfig(process.env.ENABLE_FILE_LOGS, false),
  enableConsoleLogs: setBooleanConfig(process.env.ENABLE_CONSOLE_LOGS, false),

  githubOauth: {
    clientId: 'clientId',
    clientSecret: 'clientSecret'
  },

  services: {
    rdsApi: {
      baseUrl: `http://localhost:${port}`
    }
  }
}
