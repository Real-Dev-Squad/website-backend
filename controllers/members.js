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
    const allMembers = await memberQuery.fetchMembers()
    let taskParticipants = await tasks.fetchActiveTaskMembers()
    taskParticipants = new Set(taskParticipants)
    const idleMembers = allMembers.filter(({ id }) => !taskParticipants.has(id))
    const idleMemberUserNames = idleMembers.map((member) => member.username)

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
