// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'passport'.
const passport = require('passport')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const GitHubStrategy = require('passport-github2').Strategy

try {
  passport.use(new GitHubStrategy({
    clientID: config.get('githubOauth.clientId'),
    clientSecret: config.get('githubOauth.clientSecret'),
    callbackURL: `${config.get('services.rdsApi.baseUrl')}/auth/github/callback`
  }, (accessToken: any, refreshToken: any, profile: any, done: any) => {
    return done(null, accessToken, profile)
  }
  ))
} catch (err) {
  logger.error('Error initialising passport:', err)
}
