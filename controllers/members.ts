// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ROLES'.
const { ROLES } = require('../constants/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUsers... Remove this comment to see the full error message
const { fetchUsers, migrateUsers, deleteIsMemberProperty, fetchUsersWithRole, moveToMembers: updateToMemberRole } = require('../models/members')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'tasks'.
const tasks = require('../models/tasks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUser'... Remove this comment to see the full error message
const { fetchUser } = require('../models/users')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ERROR_MESS... Remove this comment to see the full error message
const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getMembers... Remove this comment to see the full error message
const getMembers = async (req: any, res: any) => {
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getIdleMem... Remove this comment to see the full error message
const getIdleMembers = async (req: any, res: any) => {
  try {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'MEMBER' does not exist on type '{ SUPER_... Remove this comment to see the full error message
    const onlyMembers = await fetchUsersWithRole(ROLES.MEMBER)
    const taskParticipants = await tasks.fetchActiveTaskMembers()
    const idleMembers = onlyMembers?.filter(({
      id
    }: any) => !taskParticipants.has(id))
    const idleMemberUserNames = idleMembers?.map((member: any) => member.username)

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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moveToMemb... Remove this comment to see the full error message
const moveToMembers = async (req: any, res: any) => {
  try {
    const { username } = req.params
    const result = await fetchUser({ username })
    if (result.userExists) {
      const successObject = await updateToMemberRole(result.user.id)
      if (successObject.isAlreadyMember) {
        return res.boom.badRequest('User is already a member')
      }
      return res.status(204).send()
    }
    return res.boom.notFound("User doesn't exist")
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

/**
 * Returns the lists of usernames migrated
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'migrateUse... Remove this comment to see the full error message
const migrateUserRoles = async (req: any, res: any) => {
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'deleteIsMe... Remove this comment to see the full error message
const deleteIsMember = async (req: any, res: any) => {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  getMembers,
  getIdleMembers,
  moveToMembers,
  migrateUserRoles,
  deleteIsMember
}
