const setBooleanConfig = require('../utils/config').setBooleanConfig

module.exports = {
  port: process.env.PORT || 3000,
  enableFileLogs: setBooleanConfig(process.env.ENABLE_FILE_LOGS, true),
  enableConsoleLogs: setBooleanConfig(process.env.ENABLE_CONSOLE_LOGS, false),

  githubOauth: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  },

  services: {
    rdsApi: {
      baseUrl: process.env.SERVICES_RDSAPI_BASEURL
    }
  },

  databases: {
    fireStore: {
      projectId: process.env.FIRESTORE_PROJECT_ID
    }
  },

  userToken: {
    cookieName: process.env.COOKIE_NAME || 'rds-session',
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY
  }
}
