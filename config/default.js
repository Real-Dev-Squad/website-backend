/**
 * Default config to be used if environment specific config for the specific key is absent
 * Every config key to be added to `default.js` to keep a track of all config keys used in the project.
 * Use placeholders as values wherever required.
 *
 * Documentation: https://github.com/lorenwest/node-config/wiki/Configuration-Files
 */

var NODE_ENV = process.env.NODE_ENV
module.exports = {
  port: 3000,
  enableFileLogs: true,
  enableConsoleLogs: false,

  githubApi: {
    baseUrl: 'https://api.github.com',
    org: 'Real-Dev-Squad'
  },

  githubOauth: {
    clientId: '<clientId>',
    clientSecret: '<clientSecret>'
  },

  services: {
    rdsApi: {
      baseUrl: 'https://api.realdevsquad.com'
    },

    rdsUi: {
      baseUrl: 'https://realdevsquad.com',
      routes: {
        authRedirection: '/goto'
      }
    }
  },

  cors: {
    allowedOrigins: /\.realdevsquad\.com$/
  },

  userToken: {
    cookieName: `rds-session-${NODE_ENV}`,
    ttl: 30 * 24 * 60 * 60, // in seconds
    refreshTtl: 180 * 24 * 60 * 60, // in seconds
    publicKey: '<publicKey>',
    privateKey: '<privateKey>'
  }
}
