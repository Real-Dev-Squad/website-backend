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
    },

    rdsUi: {
      baseUrl: process.env.SERVICES_RDSUI_BASEURL,
      routes: {
        authRedirection: '/goto'
      }
    }
  },

  userToken: {
    cookieName: process.env.COOKIE_NAME || 'rds-session',
    ttl: process.env.USER_TOKEN_TTL || 30 * 24 * 60 * 60, // in seconds
    refreshTtl: process.env.USER_TOKEN_REFRESH_TTL || 180 * 24 * 60 * 60, // in seconds
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY
  }
}
