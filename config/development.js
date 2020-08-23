const setBooleanConfig = require('../utils/config').setBooleanConfig
const port = process.env.PORT || 3000

module.exports = {
  port: port,
  enableFileLogs: setBooleanConfig(process.env.ENABLE_FILE_LOGS, false),
  enableConsoleLogs: setBooleanConfig(process.env.ENABLE_CONSOLE_LOGS, true),

  githubOauth: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  },

  services: {
    rdsApi: {
      baseUrl: `http://localhost:${port}`
    }
  },

  databases: {
    fireStore: {
      projectId: process.env.FIRESTORE_PROJECT_ID
    }
  }
}
