const memberQuery = require('../models/members')
const tasks = require('../models/tasks')

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

/**
 * Returns the usernames of inactive/idle members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getIdleMembers = async (req, res) => {
  try {
    let allMemberUsernames = await memberQuery.fetchMembers()
    allMemberUsernames = allMemberUsernames.map(member => member.username)

    let taskParticipants = await tasks.fetchActiveTaskMembers()
    taskParticipants = new Set(taskParticipants)

    const idleMemberUserNames = allMemberUsernames.filter(member => !taskParticipants.has(member))

    return res.json({
      message: idleMemberUserNames.length ? 'Idle members returned successfully!' : 'No idle member found',
      idleMemberUserNames
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

module.exports = {
  getMembers,
  getIdleMembers
}
