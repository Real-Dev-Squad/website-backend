const ROLES = require("../constants/roles");
const members = require("../models/members");
const tasks = require("../models/tasks");
const logsQuery = require("../models/logs");
const { fetchUser } = require("../models/users");
const { logType } = require("../constants/logs");
const { MAX_CACHE_PURGE_COUNT } = require("../constants/members");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const cloudflare = require("../services/cloudflareService");

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

/**
 * Purges the Cache of Members Profile Page
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const purgeMembersCache = async (req, res) => {
  try {
    const { id, username } = req.userData;
    const logs = await logsQuery.fetchCacheLogs(id);
    const logsCount = logs.length;

    const files = [`https://members.realdevsquad.com/${username}`];

    if (logsCount < MAX_CACHE_PURGE_COUNT) {
      const response = await cloudflare.purgeCache(files);
      if (response.status === 200) {
        await logsQuery.addLog(logType.CLOUDFLARE_CACHE_PURGED, { userId: id }, { message: "Cache Purged" });
      }

      return res.json({ message: "Cache purged successfully", ...response.data });
    } else {
      return res.json({ message: "Maximum Limit Reached for Purging Cache. Please try again after some time" });
    }
  } catch (error) {
    logger.error(`Error while clearing members cache: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  archiveMembers,
  getMembers,
  getIdleMembers,
  moveToMembers,
  purgeMembersCache,
};
