const passport = require('passport')
const logger = require('../utils/logger')
const users = require('../models/users')

/**
 * Fetches the user info from GitHub and authenticates User
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */
const githubAuth = (req, res, next) => {
  let userData

  try {
    passport.authenticate('github', { session: false }, async (err, accessToken, user) => {
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

      const { isNewUser } = await users.addOrUpdate(userData)

      // @todo: Create JWT and return in a cookie
      return res.json({
        isNewUser
      })
    })(req, res, next)
  } catch (err) {
    logger.error(err)
    return res.boom.unauthorized('User cannot be authenticated')
  }
}

module.exports = {
  githubAuth
}
