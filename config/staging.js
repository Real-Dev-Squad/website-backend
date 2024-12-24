/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */
module.exports = {
  discordUnverifiedRoleId: "1120875993771544687",
  discordDeveloperRoleId: "1121445071213056071",
  discordMavenRoleId: "1152361736456896586",
  discordMissedUpdatesRoleId: "1184201657404362772",
  discordNewComersChannelId: "896184507080769559",
  enableFileLogs: false,
  enableConsoleLogs: true,

  githubOauth: {
    clientId: "c4a84431feaf604e89d1",
  },

  services: {
    rdsApi: {
      baseUrl: "https://staging-api.realdevsquad.com",
    },
    goalAPI: {
      baseUrl: "https://staging-goals-api.realdevsquad.com",
      secretKey: "123456789",
    },
  },

  integrations: {
    newrelic: {
      appName: "RDS_API_staging",
    },
  },

  googleOauth: { 
    clientId: "593897984816-gkcmp57l5266f4vatlpd47mgc7vnvvh9.apps.googleusercontent.com", 
    clientSecret: "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", 
  }
};
