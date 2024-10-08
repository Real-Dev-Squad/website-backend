const { profileStatus } = require("../constants/users");
const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");
const profileDiffsModel = firestore.collection("profileDiffs");
const obfuscate = require("../utils/obfuscate");
const { generateNextLink } = require("../utils/profileDiffs");

/**
 * Add profileDiff
 * Fetches the pending profile diffs
 * @return {Promise<profileDiffsModel|Array>}
 */
const fetchProfileDiffs = async () => {
  try {
    const snapshot = await profileDiffsModel.where("approval", "==", profileStatus.PENDING).get();
    const profileDiffs = [];
    snapshot.forEach((doc) => {
      const { email = "", phone = "" } = doc.data();

      const emailRedacted = obfuscate.obfuscateMail(email);

      const phoneRedacted = obfuscate.obfuscatePhone(phone);

      profileDiffs.push({
        id: doc.id,
        ...doc.data(),
        email: emailRedacted,
        phone: phoneRedacted,
      });
    });
    return profileDiffs;
  } catch (err) {
    logger.error("Error retrieving profile diffs ", err);
    throw err;
  }
};

const fetchProfileDiffsWithPagination = async (status, order, size, username, cursor) => {
  try {
    let query = profileDiffsModel.where("approval", "==", status);

    if (username) {
      const userSnapshot = await userModel
        .where("username", ">=", username)
        .where("username", "<=", username + "\uf8ff")
        .get();
      const userIds = userSnapshot.docs.map((doc) => doc.id);
      if (userIds.length === 0) return { profileDiffs: [], next: "" };
      query = query.where("userId", "in", userIds);
    }

    query = query.orderBy("timestamp", order);

    if (cursor) {
      const cursorSnapshot = await profileDiffsModel.doc(cursor).get();
      query = query.startAfter(cursorSnapshot);
    }

    const snapshot = await query.limit(size).get();

    const profileDiffs = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      let emailRedacted = "";
      let phoneRedacted = "";
      if (data.email) {
        emailRedacted = obfuscate.obfuscateMail(data.email);
      }
      if (data.phone) {
        phoneRedacted = obfuscate.obfuscatePhone(data.phone);
      }

      profileDiffs.push({
        id: doc.id,
        ...data,
        email: emailRedacted,
        phone: phoneRedacted,
      });
    });

    const resultDataLength = profileDiffs.length;
    const isNextLinkRequired = size && resultDataLength === size;
    const lastVisible = isNextLinkRequired && profileDiffs[resultDataLength - 1];

    const nextPageParams = {
      dev: true,
      status,
      order,
      size,
      username,
      cursor: lastVisible?.id,
    };

    let nextLink = "";
    if (lastVisible) {
      nextLink = generateNextLink(nextPageParams);
    }

    return { profileDiffs, next: nextLink };
  } catch (err) {
    logger.error("Error retrieving profile diffs ", err);
    throw err;
  }
};

/**
 * Fetches the profileDiff data of the provided profileDiff Id
 * @param profileDiffId profileDiffId of the diffs need to be fetched
 * @returns profileDiff Data
 */
const fetchProfileDiff = async (profileDiffId) => {
  try {
    const profileDiff = await profileDiffsModel.doc(profileDiffId).get();

    if (!profileDiff.exists) {
      return { profileDiffExists: false };
    }

    const profileDiffData = profileDiff.data();
    const emailRedacted = profileDiffData.email ? obfuscate.obfuscateMail(profileDiffData.email) : "";
    const phoneRedacted = profileDiffData.phone ? obfuscate.obfuscatePhone(profileDiffData.phone) : "";

    return {
      id: profileDiff.id,
      profileDiffExists: true,
      ...profileDiff.data(),
      email: emailRedacted,
      phone: phoneRedacted,
    };
  } catch (err) {
    logger.error("Error retrieving profile Diff", err);
    throw err;
  }
};

/** Add profileDiff
 *
 * @param profileDiffData { Object }: Data to be added
 */

const add = async (profileDiffData) => {
  try {
    const profileDiff = await profileDiffsModel.add({
      ...profileDiffData,
    });
    return profileDiff.id;
  } catch (err) {
    logger.error("Error in adding profile diff", err);
    throw err;
  }
};

/**
 * Update profileDiff
 *
 * @param profileDiffData { Object }: Data to be added
 * @param profileId { String }: Id of the profileDiff
 */

const updateProfileDiff = async (profileDiffData, profileId) => {
  try {
    const profileDiff = await profileDiffsModel.doc(profileId).get();
    const data = profileDiff.data();
    if (!data) return { notFound: true };

    await profileDiffsModel.doc(profileId).set({
      ...data,
      ...profileDiffData,
    });

    return { id: profileDiff.id, userId: data.userId };
  } catch (err) {
    logger.error("Error in updating profile diff", err);
    throw err;
  }
};

module.exports = {
  fetchProfileDiffs,
  fetchProfileDiff,
  add,
  updateProfileDiff,
  fetchProfileDiffsWithPagination,
};
