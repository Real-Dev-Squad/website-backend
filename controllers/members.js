const members = require("../models/members");
const users = require("../models/users");
const tasks = require("../models/tasks");

const ERROR_MESSAGE = "Something went wrong. Please try again or contact admin";

/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getMembers = async (req, res) => {
  try {
    const allUsers = await members.fetchUsers();

    return res.json({
      message: allUsers.length ? "Members returned successfully!" : "No member found",
      members: allUsers,
    });
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

/**
 * Returns the usernames of inactive/idle members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getIdleMembers = async (req, res) => {
  try {
    const allusers = await users.queryUser({ status: "idle" });
    const taskParticipants = await tasks.fetchActiveTaskMembers();
    const idleMembers = allusers?.filter(({ id }) => !taskParticipants.has(id));

    return res.json({
      message: idleMembers.length ? "Idle members returned successfully!" : "No idle member found",
      idleMembers,
    });
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

/**
 * Makes a new member a member
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const moveToMembers = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await users.fetchUser({ username });
    if (result.userExists) {
      const successObject = await members.moveToMembers(result.user.id);
      if (successObject.isAlreadyMember) {
        return res.boom.badRequest("User is already a member");
      }
      return res.status(204).send();
    }
    return res.boom.notFound("User doesn't exist");
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`);
    return res.boom.badImplementation(ERROR_MESSAGE);
  }
};

/**
 * Returns the lists of usernames migrated
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const migrateUserRoles = async (req, res) => {
  try {
    const migratedUserData = await members.migrateUsers();
    return res.json({
      message: "Users migrated successfully",
      ...migratedUserData,
    });
  } catch (error) {
    logger.error(`Error while migrating user roles: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

/**
 * Returns the lists of usernames whose isMember property was deleted
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const deleteIsMember = async (req, res) => {
  try {
    const deletedIsMemberData = await members.deleteIsMemberProperty();
    return res.json({
      message: "Users isMember deleted successfully",
      ...deletedIsMemberData,
    });
  } catch (error) {
    logger.error(`Error while deleting isMember: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

/**
 * Archives old member from new members list.
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const archiveMembers = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await users.fetchUser({ username });
    if (user?.userExists) {
      const successObject = await members.addArchiveRoleToMembers(user.user.id);
      if (successObject.isArchived) {
        return res.boom.badRequest("User is already archived");
      }
      return res.status(204).send();
    }
    return res.boom.notFound("User doesn't exist");
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`);
    return res.boom.badImplementation(ERROR_MESSAGE);
  }
};

module.exports = {
  archiveMembers,
  getMembers,
  getIdleMembers,
  moveToMembers,
  migrateUserRoles,
  deleteIsMember,
};
