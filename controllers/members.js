const { ROLES } = require('../constants/users')
const { fetchUsers, migrateUsers, deleteIsMemberProperty, fetchUsersWithRole } = require('../models/members')
const tasks = require('../models/tasks')

/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getMembers = async (req, res) => {
  try {
    const allUsers = await fetchUsers()

    return res.json({
      message: allUsers.length ? 'Members returned successfully!' : 'No member found',
      members: allUsers
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
    const onlyMembers = await fetchUsersWithRole(ROLES.MEMBER)
    const taskParticipants = await tasks.fetchActiveTaskMembers()
    const idleMembers = onlyMembers?.filter(({ id }) => !taskParticipants.has(id))
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
 * Returns the lists of usernames migrated
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const migrateUserRoles = async (req, res) => {
  try {
    const migratedUserData = await migrateUsers()
    return res.json({
      message: 'Users migrated successfully',
      ...migratedUserData
    })
  } catch (error) {
    logger.error(`Error while migrating user roles: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

/**
 * Returns the lists of usernames whose isMember property was deleted
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const deleteIsMember = async (req, res) => {
  try {
    const deletedIsMemberData = await deleteIsMemberProperty()
    return res.json({
      message: 'Users isMember deleted successfully',
      ...deletedIsMemberData
    })
  } catch (error) {
    logger.error(`Error while deleting isMember: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

module.exports = {
  getMembers,
  getIdleMembers,
  migrateUserRoles,
  deleteIsMember
}
