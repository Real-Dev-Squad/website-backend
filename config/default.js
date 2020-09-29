/**
 * Default config to be used if environment specific config for the specific key is absent
 * Every config key to be added to `default.js` to keep a track of all config keys used in the project.
 * Use placeholders as values wherever required.
 *
 * Documentation: https://github.com/lorenwest/node-config/wiki/Configuration-Files
 */
module.exports = {
  port: 3000,
  enableFileLogs: true,
  enableConsoleLogs: false,

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

  userToken: {
    cookieName: 'rds-session',
    ttl: 30 * 24 * 60 * 60, // in seconds
    refreshTtl: 180 * 24 * 60 * 60, // in seconds
    publicKey: '<publicKey>',
    privateKey: '<privateKey>'
  }
}
