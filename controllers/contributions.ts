// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const contributionsService = require('../services/contributions')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUser'... Remove this comment to see the full error message
const { fetchUser } = require('../models/users')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ERROR_MESS... Remove this comment to see the full error message
const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the  contributions of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getUserCon... Remove this comment to see the full error message
const getUserContributions = async (req: any, res: any) => {
  try {
    const username = req.params.username
    const result = await fetchUser({ username: req.params.username })
    if (result.userExists) {
      const contributions = await contributionsService.getUserContributions(username)
      return res.json(contributions)
    }
    return res.boom.notFound('User doesn\'t exist')
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  getUserContributions
}
