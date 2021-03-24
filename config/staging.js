/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */
module.exports = {
  enableFileLogs: false,
  enableConsoleLogs: true,

  githubOauth: {
    clientId: 'c4a84431feaf604e89d1'
  },

  services: {
    rdsApi: {
      baseUrl: 'https://staging-api.realdevsquad.com'
    }
  },

  cors: {
    allowedOrigins: /(\.realdevsquad\.com$)|(localhost)/ // Allow *.realdevsquad.com and localhost for non-production envs
  }
}
