// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'passport'.
const passport = require('passport')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'users'.
const users = require('../models/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authServic... Remove this comment to see the full error message
const authService = require('../services/authService')

/**
 * Fetches the user info from GitHub and authenticates User
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */
const githubAuth = (req: any, res: any, next: any) => {
  let userData
  const authRedirectionUrl = `${config.get('services.rdsUi.baseUrl')}${config.get('services.rdsUi.routes.authRedirection')}`
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'URL'.
  const rdsUiUrl = new URL(config.get('services.rdsUi.baseUrl'))

  try {
    return passport.authenticate('github', { session: false }, async (err: any, accessToken: any, user: any) => {
      if (err) {
        logger.error(err)
        return res.boom.unauthorized('User cannot be authenticated')
      }

      userData = {
        github_id: user.username,
        github_display_name: user.displayName,
        tokens: {
          githubAccessToken: accessToken
        }
      }

      const { userId } = await users.addOrUpdate(userData)

      const token = authService.generateAuthToken({ userId })

      // respond with a cookie
      res.cookie(config.get('userToken.cookieName'), token, {
        domain: rdsUiUrl.hostname,
        expires: new Date(Date.now() + config.get('userToken.ttl') * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      })

      return res.redirect(authRedirectionUrl)
    })(req, res, next);
  } catch (err) {
    logger.error(err)
    return res.boom.unauthorized('User cannot be authenticated')
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  githubAuth
}
