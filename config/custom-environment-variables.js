/**
 * Contains environment variable mapping to the config key
 * The config values are overridden from the specified values in default.js or <env_name>.js
 * if the specified environment variable exists
 *
 * Documentation: https://github.com/lorenwest/node-config/wiki/Environment-Variables
 */
module.exports = {
  port: {
    __name: "PORT",
    __format: "number",
  },
  enableFileLogs: {
    __name: "ENABLE_FILE_LOGS",
    __format: "boolean",
  },
  enableConsoleLogs: {
    __name: "ENABLE_CONSOLE_LOGS",
    __format: "boolean",
  },

  githubApi: {
    baseUrl: "GITHUB_API_BASE_URL",
    org: "GITHUB_ORGANISATION",
  },

  githubOauth: {
    clientId: "GITHUB_CLIENT_ID",
    clientSecret: "GITHUB_CLIENT_SECRET",
  },

  githubAccessToken: "GITHUB_PERSONAL_ACCESS_TOKEN",

  firestore: "FIRESTORE_CONFIG",

  services: {
    rdsApi: {
      baseUrl: "SERVICES_RDSAPI_BASEURL",
    },

    rdsUi: {
      baseUrl: "SERVICES_RDSUI_BASEURL",
      routes: {
        authRedirection: "SERVICES_RDSUI_ROUTES_AUTH_REDIRECTION",
      },
    },

    goalAPI: {
      baseUrl: "GOALS_BASE_URL",
      secretKey: "GOALS_SECRET_KEY",
    },

    discordBot: {
      baseUrl: "DISCORD_BASE_URL",
    },
  },

  emailSubscriptionCredentials: {
    email: "<RDS_EMAIL>",
    password: "<EMAIL PASSWORD GENERATED AFTER 2FA>",
    host: "<smtp host>",
    port: "<number>",
  },

  userToken: {
    cookieName: "COOKIE_NAME",
    ttl: {
      __name: "USER_TOKEN_TTL",
      __format: "number",
    },
    refreshTtl: {
      __name: "USER_TOKEN_REFRESH_TTL",
      __format: "number",
    },
    publicKey: "PUBLIC_KEY",
    privateKey: "PRIVATE_KEY",
  },

  botToken: {
    botPublicKey: "BOT_PUBLIC_KEY",
  },

  cronJobHandler: {
    publicKey: "CRON_JOB_PUBLIC_KEY",
  },

  rdsServerlessBot: {
    rdsServerLessPrivateKey: "RDS_SERVERLESS_PRIVATE_KEY",
    ttl: "RDS_SERVERLESS_TTL",
  },

  cloudinary: {
    cloud_name: "CLOUDINARY_CLOUD_NAME",
    api_key: "CLOUDINARY_API_KEY",
    api_secret: "CLOUDINARY_API_SECRET_KEY",
  },

  integrations: {
    newrelic: {
      appName: "INTEGRATIONS_NEWRELIC_APPNAME",
      licenseKey: "INTEGRATIONS_NEWRELIC_LICENSEKEY",
    },
  },

  routesCacheTTL: {
    "/members": "ROUTESCACHETTL_MEMBERS",
  },

  Event100ms: {
    APP_ACCESS_KEY: "EVENT_100MS_APP_ACCESS_KEY",
    APP_SECRET: "EVENT_100MS_APP_SECRET",
  },

  externalServices: {
    EXTERNAL_SERVICE_PUBLIC_KEY: "EXTERNAL_SERVICE_PUBLIC_KEY",
  },
};
