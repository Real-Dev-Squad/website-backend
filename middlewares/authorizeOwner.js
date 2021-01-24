const usersController = require('../controllers/usersController')
/**
 * Middleware to validate the authorized routes to fetch open PRs
 * 1] Verifies the user's role as Application owner
 * * 2] In case of absence of user role, error is invoked
 *
 * The currently implemented mechanism satisfies the current use case.
 * Authentication with JWT and a refreshToken to be added once we have user permissions and authorizations to be handled
 *
 * @todo: Add tests to assert on refreshed JWT generation by modifying the TTL values for the specific test. Currently not possible in the absence of a test-suite.
 *
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 * @return {Object} - Returns unauthorized user if the role is not assigned
 */
module.exports = async (req, res, next) => {
  try {
    // get user data from `req.userData` for further use
    const accountOwners = await usersController.getAccountOwners()
    if (!req.userData.incompleteUserDetails) {
      if (accountOwners.filter((owner) => owner.username === req.userData.username)) {
        return next()
      } else {
        return res.boom.unauthorized('Unauthorized User')
      }
    } else {
      return res.boom.unauthorized('Unauthorized User')
    }
  } catch (err) {
    logger.error(err)
    return res.boom.unauthorized('Unauthorized User')
  }
}
