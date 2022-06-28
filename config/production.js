/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */
module.exports = {
  userToken: {
    cookieName: "rds-session",
  },

  cloudflare: {
    CLOUDFLARE_ZONE_ID: "123123123123123",
    CLOUDFLARE_X_AUTH_KEY: "123abc123abc123abc",
    CLOUDFLARE_X_AUTH_EMAIL: "abc@xyz.com",
  },
};
