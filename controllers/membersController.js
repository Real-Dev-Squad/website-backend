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
      message: 'Members returned successfully!',
      members: allMembers
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

/**
 * Fetches the data about our inactive/idle members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getIdleMembers = async (req, res) => {
  try {
    let allMemberUsernames = await memberQuery.fetchMemberUsernames()
    allMemberUsernames = allMemberUsernames.map(member => member.username)

    let taskParticipants = await tasks.fetchActiveTaskMembers()
    taskParticipants = [...new Set(taskParticipants)]

    const idleMemberUserNames = allMemberUsernames.filter(member => taskParticipants.indexOf(member) === -1)

    return res.json({
      message: 'Idle members returned successfully!',
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
