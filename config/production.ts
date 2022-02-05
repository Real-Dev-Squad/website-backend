/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  userToken: {
    cookieName: 'rds-session'
  }
}
