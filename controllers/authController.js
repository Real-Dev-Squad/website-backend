const passport = require('passport')
const logger = require('../utils/logger')

/**
 * Fetches the user info from GitHub
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */
const githubAuth = (req, res, next) => {
  passport.authenticate('github', { session: false }, async (err, accessToken, user) => {
    if (err) {
      logger.error(err)
      return res.boom.unauthorized('User cannot be authenticated')
    }

    // @todo: Store user info and accessToken in DB, create JWT and return in a cookie
    // return success message
    return res.json({
      msg: 'success'
    })
  })(req, res, next)
}

module.exports = {
  githubAuth
}
