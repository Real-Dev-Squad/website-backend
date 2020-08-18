const setBooleanConfig = require('../utils/config').setBooleanConfig
const port = process.env.PORT || 3000

module.exports = {
  port: port,
  enableLogTrasports: setBooleanConfig(process.env.ENABLE_LOGS, true),

  githubOauth: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  },

  services: {
    rdsApi: {
      baseUrl: `http://localhost:${port}`
    }
  }
}
