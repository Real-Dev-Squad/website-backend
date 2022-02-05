/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
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
