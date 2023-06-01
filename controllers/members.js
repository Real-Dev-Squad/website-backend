const { NotFound, Unauthorized, ServiceUnavailable } = require("http-errors");
const ROLES = require("../constants/roles");
const members = require("../models/members");
const tasks = require("../models/tasks");
const { fetchUser } = require("../models/users");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getMembers = async (req, res) => {
  try {
    const allUsers = await members.fetchUsers(req.query);

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
    const onlyMembers = await members.fetchUsersWithRole(ROLES.MEMBER);
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
    const result = await fetchUser({ username });
    if (result.userExists) {
      const successObject = await members.moveToMembers(result.user.id);
      // console.log(successObject);
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
    const user = await fetchUser({ username });
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
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

const updateRoles = async (req, res) => {
  try{
    const userId = req.params.id;
    const user = await fetchUser({ userId });
    if (user?.userExists) {
      const dataToUpdate = req.body;
      const successObject = await members.updateRoles(user.user.id, dataToUpdate);
      let statusCode;
      if (successObject.isRoleUpdated) {
        statusCode = 204;
        responseObject.message = "role updated successfully!";
      }
      return res.status(statusCode).json(responseObject);
    }
  } catch (error) {
    if (error instanceof NotFound) {
      return res.status(404).json({
        message: "User not found",
      });
    }else if(error instanceof Unauthorized) {
      return res.status(401).json({
        message: "Unauthenticated User",
      });
    }else if(error instanceof ServiceUnavailable) {
      return res.status(503).json({
        message: "Unauthenticated User",
      });
    }
    logger.error(error.message);
    return res.boom.badRequest("Invalid Request");
  }
}

module.exports = {
  archiveMembers,
  getMembers,
  getIdleMembers,
  moveToMembers,
  updateRoles,
};
