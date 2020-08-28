const passport = require('passport')
const config = require('config')
const logger = require('../utils/logger')
const users = require('../models/users')
const authService = require('../services/authService')

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

      const { isNewUser, userId } = await users.addOrUpdate(userData)

      const token = await authService.generateAuthToken({ userId })

      // respond with a cookie
      res.cookie(config.get('userToken.cookieName'), token, {
        expires: new Date(Date.now() + config.get('userToken.ttl') * 1000),
        httpOnly: true,
        secure: true
      })

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
