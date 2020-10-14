/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */
module.exports = {
  cors: {
    allowedOrigins: /(\.realdevsquad\.com$)|(localhost)/ // Allow *.realdevsquad.com and localhost for non-production envs
  }
}
