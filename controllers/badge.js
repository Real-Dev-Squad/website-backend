const badgeQuery = require('../models/badges')
const userQuery = require('../models/users')

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

/**
 * Create the Badge
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Badge object
 * @param res {Object} - Express response object
 */

const createBadges = async (req, res) => {
  try {
    const getUser = await userQuery.fetchUser({ username: req.query.username })
    const isBadgeEmpty = Object.entries(req.body).length === 0
    const isMember = getUser.user.isMember
    if (isBadgeEmpty) {
      res.status(204).send('empty badge object provided')
    } else if (!isMember) {
      res.status(401).send('user is not a member')
    } else {
      await badgeQuery.createBadges(req.body)
      const allBadges = await badgeQuery.fetchBadges(req.query)
      return res.json({
        message: 'badge successfully created!',
        badges: allBadges
      })
    }
    return res.status(204).send()
  } catch (error) {
    logger.error(`Error while fetching all badges: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Update the Badge
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Badge object
 * @param res {Object} - Express response object
 */
const updateBadges = async (req, res) => {
  try {
    const badgeId = req.query.id
    const getUser = await userQuery.fetchUser({ username: req.query.username })
    const isBadgeEmpty = Object.entries(req.body).length === 0
    const isMember = getUser.user.isMember
    if (isBadgeEmpty) {
      res.status(204).send('empty badge object provided')
    } else if (!isMember) {
      res.status(401).send('user is not a member')
    } else {
      await badgeQuery.updateBadges(req.body, badgeId)
      const allBadges = await badgeQuery.fetchBadges(req.query)
      return res.json({
        message: 'badge successfully updated!',
        badges: allBadges
      })
    }
    return res.status(204).send()
  } catch (error) {
    logger.error(`Error while updating user: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getBadges,
  createBadges,
  updateBadges
}
