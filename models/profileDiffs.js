const { profileStatus } = require("../constants/users");
const firestore = require("../utils/firestore");
const profileDiffsModel = firestore.collection("profileDiffs");
const obfuscate = require("../utils/obfuscate");

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

/**
 * Fetches the profileDiff data of the provided profileDiff Id
 * @param profileDiffId profileDiffId of the diffs need to be fetched
 * @returns profileDiff Data
 */
const fetchProfileDiff = async (profileDiffId) => {
  try {
    const profileDiff = await profileDiffsModel.doc(profileDiffId).get();
    const profileDiffData = profileDiff.data();
    return profileDiffData;
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
};
