/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */
module.exports = {
  discordUnverifiedRoleId: "1120875993771544687",
  discordDeveloperRoleId: "1121445071213056071",
  discordNewComersChannelId: "709080951824842783",
  enableFileLogs: false,
  enableConsoleLogs: true,

  githubOauth: {
    clientId: "c4a84431feaf604e89d1",
  },

  services: {
    rdsApi: {
      baseUrl: "https://staging-api.realdevsquad.com",
    },
  },

  integrations: {
    newrelic: {
      appName: "RDS_API_staging",
    },
  },
};
