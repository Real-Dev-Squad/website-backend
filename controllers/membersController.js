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

    return res.json({
      message: allMembers.length ? 'Members returned successfully!' : 'No member found',
      members: allMembers
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

module.exports = {
  getMembers
}
