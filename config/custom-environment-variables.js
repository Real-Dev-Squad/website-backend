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

  cloudinary: {
    cloud_name: "CLOUDINARY_CLOUD_NAME",
    api_key: "CLOUDINARY_API_KEY",
    api_secret: "CLOUDINARY_API_SECRET_KEY",
  },

  // Cloudflare
  cloudflare: {
    CLOUDFLARE_ZONE_ID: "<CLOUDFLARE_ZONE_ID>",
    CLOUDFLARE_X_AUTH_KEY: "<CLOUDFLARE_X_AUTH_KEY>",
    CLOUDFLARE_X_AUTH_EMAIL: "<CLOUDFLARE_X_AUTH_EMAIL>",
    CLOUDFLARE_WORDPRESS_AUTHORIZATION_TOKEN: "<CLOUDFLARE_WORDPRESS_AUTHORIZATION_TOKEN>",
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
};
