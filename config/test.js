const setBooleanConfig = require('../utils/config').setBooleanConfig
const port = process.env.PORT || 3000

module.exports = {
  port: port,
  enableFileLogs: setBooleanConfig(process.env.ENABLE_FILE_LOGS, false),
  // Console logs are set to avoid the winston error of no defined transports
  enableConsoleLogs: setBooleanConfig(process.env.ENABLE_CONSOLE_LOGS, true),

  githubOauth: {
    clientId: 'clientId',
    clientSecret: 'clientSecret'
  },

  services: {
    rdsApi: {
      baseUrl: `http://localhost:${port}`
    }
  },

  databases: {
    fireStore: {
      projectId: process.env.FIRESTORE_PROJECT_ID || 'rds-test'
    }
  }
}
