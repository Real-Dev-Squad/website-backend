const firestore = require("../utils/firestore");
const logsModel = firestore.collection("logs");
const admin = require("firebase-admin");

/**
 * Adds log
 *
 * @param type { String }: Type of the log
 * @param meta { Object }: Meta data of the log
 * @param body { Object }: Body of the log
 */
const add = async (type, meta, body) => {
  try {
    const log = {
      type,
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      meta,
      body,
    };
    await logsModel.add(log);
  } catch (err) {
    logger.error("Error in adding log", err);
    throw err;
  }
};

/**
 * Add user profile changes to logs
 *
 * @param user { Object }: Data of the current user
 * @param profileDiffs { Object }: Data of the requested changes
 * @param username { String }: Username of the user
 * @param approvedBy { String }: Username of the super_user
 */
const addProfileLog = async (user, profileDiffs, username, approvedBy) => {
  try {
    const profileObject = (data) => {
      return {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        yoe: data.yoe || "",
        company: data.company || "",
        designation: data.designation || "",
        github_id: data.github_id || "",
        linkedin_id: data.linkedin_id || "",
        twitter_id: data.twitter_id || "",
        instagram_id: data.instagram_id || "",
        website: data.website || "",
      };
    };
    const oldProfile = profileObject(user);
    const newProfile = profileObject(profileDiffs);
    const logBody = { oldProfile, newProfile };

    await add("ProfileChange", { username, approvedBy }, logBody);
  } catch (err) {
    logger.error("Error in creating profile change log", err);
    throw err;
  }
};

/**
 * Fetches logs
 *
 * @param query { String }: Type of the log
 * @param param { Object }: Fields to filter logs
 */
const fetch = async (query, param) => {
  try {
    let call = logsModel.where("type", "==", param);
    Object.keys(query).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      call = call.where(`meta.${key}`, "==", query[key]);
    });

    const snapshot = await call.get();
    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({
        ...doc.data(),
      });
    });
    return logs;
  } catch (err) {
    logger.error("Error in adding log", err);
    throw err;
  }
};

module.exports = {
  add,
  addProfileLog,
  fetch,
};
