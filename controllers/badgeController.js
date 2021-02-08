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

module.exports = {
  getBadges
}
