const { ROLES } = require("../constants/users");
const members = require("../models/members");
const tasks = require("../models/tasks");
const { fetchUser } = require("../models/users");
const { fetch } = require("../utils/fetch");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

const CLOUDFLARE_ZONE_ID = config.get("cloudflare.CLOUDFLARE_ZONE_ID");
const CLOUDFLARE_PURGE_CACHE_API = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`;
const POST = "POST";

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
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
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

/**
 * Purges the Cache of Members Profile Page
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const purgeMembersCache = async (req, res) => {
  try {
    const { username } = req.userData;

    if (!username) return res.boom.badRequest("Username is not valid");

    const response = await fetch(
      CLOUDFLARE_PURGE_CACHE_API,
      POST,
      null,
      { files: [`https://members.realdevsquad.com/${username}`] },
      {
        "X-Auth-Key": config.get("cloudflare.CLOUDFLARE_X_AUTH_KEY"),
        "X-Auth-Email": config.get("cloudflare.CLOUDFLARE_X_AUTH_EMAIL"),
      }
    );

    return res.json({ message: "Cache purged successfully", ...response.data });
  } catch (error) {
    logger.error(`Error while clearing members cache: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  archiveMembers,
  getMembers,
  getIdleMembers,
  purgeMembersCache,
  moveToMembers,
  migrateUserRoles,
  deleteIsMember,
};
