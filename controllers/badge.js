const badgeQuery = require('../models/badges')

/**
 * Get badges data
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getBadges = async (req, res) => {
  try {
    const allBadges = await badgeQuery.fetchBadges(req.query)
    return res.json({
      message: 'Badges returned successfully!',
      badges: allBadges
    })
  } catch (error) {
    logger.error(`Error while fetching all badges: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

const getUserBadges = async (req, res) => {
  try {
    const result = await badgeQuery.fetchUserBadges(req.params.username)
    return result.userExists
      ? res.json({ message: 'User badges returned successfully!', userBadges: result.userBadges })
      : res.boom.notFound('The user does not exist')
  } catch (error) {
    logger.error(`Error while fetching all user badges: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getBadges,
  getUserBadges
}
