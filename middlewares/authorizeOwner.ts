// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'users'.
const users = require('../controllers/users')
/**
 * Middleware to validate the authorized routes to be able to create & Update tasks
 * 1] Verifies the user's role as Application owner
 * * 2] In case of absence of user role, error is invoked
 *
 * The currently implemented mechanism satisfies the current use case.
 * Authentication with JWT and a refreshToken to be added once we have user permissions and authorizations to be handled
 *
 *
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 * @return {Object} - Returns unauthorized user if the role is not assigned
 */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = async (req: any, res: any, next: any) => {
  try {
    // get user data from `req.userData` for further use
    const accountOwners = await users.getAccountOwners()
    const { username } = req.userData

    if (accountOwners.some((owner: any) => owner.username === username)) {
      return next()
    } else {
      return res.boom.forbidden('Unauthorized User')
    }
  } catch (err) {
    logger.error(err)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}
