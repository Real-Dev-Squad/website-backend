const logsQuery = require("../models/logs");
const userQuery = require("../models/users");
const cloudflare = require("../services/cloudflareService");
const { logType } = require("../constants/logs");
const { MAX_CACHE_PURGE_COUNT } = require("../constants/cloudflareCache");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Purges the Cache of Members Profile Page
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const purgeCache = async (req, res) => {
  try {
    const { id, username, roles } = req.userData;
    const logs = await logsQuery.fetchCacheLogs(id);
    const logsCount = logs.length;

    // Cache purged by a superuser without rate limits
    if (req.body.user) {
      if (roles.super_user) {
        const { user } = req.body;
        const userDetails = await userQuery.fetchUser({ username: user });
        if (!userDetails.userExists) {
          return res.boom.badRequest("");
        }
        return purge(res, id, user, true, userDetails);
      } else {
        return res.boom.unauthorized("You are not authorized to perform this action");
      }
    }
    // Cache purged by a user with rate limits
    else {
      if (logsCount < MAX_CACHE_PURGE_COUNT) {
        return purge(res, id, username, false);
      } else {
        return res.json({ message: "Maximum Limit Reached for Purging Cache. Please try again after some time" });
      }
    }
  } catch (error) {
    logger.error(`Error while clearing members cache: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

const purge = async (res, id, username, isSuperUser, userDetails) => {
  try {
    const files = [`https://members.realdevsquad.com/${username}`];
    const response = await cloudflare.purgeCache(files);
    if (response.status === 200) {
      if (isSuperUser) {
        await logsQuery.addLog(
          logType.CLOUDFLARE_CACHE_PURGED,
          { userId: id, purgedFor: userDetails.user.id },
          { message: "Cache Purged" }
        );
      } else {
        await logsQuery.addLog(logType.CLOUDFLARE_CACHE_PURGED, { userId: id }, { message: "Cache Purged" });
      }
    }
    return res.json({ message: "Cache purged successfully", ...response.data });
  } catch (error) {
    logger.error(`Error while clearing members cache: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

/**
 * Fetches cache metadata
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchPurgedCacheMetadata = async (req, res) => {
  try {
    const { id } = req.userData;
    const logs = await logsQuery.fetchCacheLogs(id);
    if (logs.length !== 0) {
      const latestCacheMetadata = logs[logs.length - 1];
      const { timestamp } = latestCacheMetadata;
      return res.json({
        message: "Purged cache metadata returned successfully!",
        count: logs.length,
        timeLastCleared: timestamp._seconds,
      });
    } else if ((await logsQuery.fetchLastAddedCacheLog(id)).length !== 0) {
      const lastLog = await logsQuery.fetchLastAddedCacheLog(id);
      const { timestamp } = lastLog[0];
      return res.json({
        message: "Purged cache metadata returned successfully!",
        count: 0,
        timeLastCleared: timestamp._seconds,
      });
    } else {
      return res.json({
        message: "No cache is cleared yet",
        count: 0,
      });
    }
  } catch (error) {
    logger.error(`Error while fetching cache metadata: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  purgeCache,
  fetchPurgedCacheMetadata,
};
