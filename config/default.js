const setBooleanConfig = require('../utils/config').setBooleanConfig

module.exports = {
  port: process.env.PORT || 3000,
  enableLogTrasports: setBooleanConfig(process.env.ENABLE_LOGS, true),

  githubOauth: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  },

  services: {
    rdsApi: {
      baseUrl: process.env.SERVICES_RDSAPI_BASEURL
    }
  }
}
