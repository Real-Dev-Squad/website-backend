const setBooleanConfig = require('../utils/config').setBooleanConfig
const port = process.env.PORT || 3000

module.exports = {
  port: port,
  enableLogTrasports: setBooleanConfig(process.env.ENABLE_LOGS, true),

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
