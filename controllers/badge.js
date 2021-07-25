const badgeQuery = require('../models/badges')
const logger = require('../utils/logger')

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
    if (result.userExists) {
      if (result.userBadges.length === 0) {
        return res.json({
          message: 'This user does not have any badges'
        })
      }
      return res.json({
        message: 'User badges returned successfully!',
        userBadges: result.userBadges
      })
    } else {
      return res.boom.notFound('The user does not exist')
    }
  } catch (error) {
    logger.error(`Error while fetching all user badges: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getBadges,
  getUserBadges
}
