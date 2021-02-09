const memberQuery = require('../models/members')

/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getMembers = async (req, res) => {
  try {
    const allMembers = await memberQuery.fetchMembers()

    if (allMembers.length) {
      return res.json({
        message: 'Members returned successfully!',
        members: allMembers
      })
    }

    return res.json({
      message: 'No member found!'
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

module.exports = {
  getMembers
}
