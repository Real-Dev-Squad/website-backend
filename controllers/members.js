const memberQuery = require('../models/members')
const tasks = require('../models/tasks')
const { fetchUser } = require('../models/users')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

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
    const taskParticipants = await tasks.fetchActiveTaskMembers()
    const idleMembers = allMembers?.filter(({ id }) => !taskParticipants.has(id))
    const idleMemberUserNames = idleMembers?.map((member) => member.username)

    return res.json({
      message: idleMemberUserNames.length ? 'Idle members returned successfully!' : 'No idle member found',
      idleMemberUserNames
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

/**
 * Makes a new member a member
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const moveToMembers = async (req, res) => {
  try {
    const username = req.params.username
    const result = await fetchUser({ username })
    if (result.userExists) {
      const alreadyMember = await memberQuery.moveToMembers(result.user.id)
      if (alreadyMember) {
        return res.status(400).json({ message: 'User Already is a member' })
      }
      return res.status(204).json({ message: 'User successfully made a member' })
    }
    return res.boom.notFound("User doesn't exist")
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getMembers,
  getIdleMembers,
  moveToMembers
}
