const ROLES = require("../constants/roles");
const members = require("../models/members");
const tasks = require("../models/tasks");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const dataAccess = require("../services/dataAccessLayer");
const { addLog } = require("../models/logs");
/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getMembers = async (req, res) => {
  try {
    const allUsers = await dataAccess.retrieveMembers(req.query);
    return res.json({
      message: allUsers.length ? "Members returned successfully!" : "No member found",
      members: allUsers,
    });
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
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
    const onlyMembers = await dataAccess.retrieveUsersWithRole(ROLES.MEMBER);
    const taskParticipants = await tasks.fetchActiveTaskMembers();
    const idleMembers = onlyMembers?.filter(({ id }) => !taskParticipants.has(id));
    const idleMemberUserNames = idleMembers?.map((member) => member.username);

    return res.json({
      message: idleMemberUserNames.length ? "Idle members returned successfully!" : "No idle member found",
      idleMemberUserNames,
    });
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
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
    const result = await dataAccess.retrieveUsers({ username });
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
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
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
    const user = await dataAccess.retrieveUsers({ username });
    const superUserId = req.userData.id;
    const { reason } = req.body;
    const roles = req?.userData?.roles;
    if (user?.userExists) {
      const successObject = await members.addArchiveRoleToMembers(user.user.id);
      if (successObject.isArchived) {
        return res.boom.badRequest("User is already archived");
      }
      const body = {
        reason: reason || "",
        archived_user: {
          user_id: user.user.id,
          username: user.user.username,
        },
        archived_by: {
          user_id: superUserId,
          roles: roles,
        },
      };

      addLog("archived-details", {}, body);
      return res.status(204).send();
    }
    return res.boom.notFound("User doesn't exist");
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  archiveMembers,
  getMembers,
  getIdleMembers,
  moveToMembers,
};
