const firestore = require("../utils/firestore");
const profileDiffsModel = firestore.collection("profileDiffs");

/**
 * Add profileDiff
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
const update = async (profileDiffData, profileId) => {
  try {
    const profileDiff = await profileDiffsModel.doc(profileId).get();
    await profileDiffsModel.doc(profileId).set({
      ...profileDiff.data(),
      ...profileDiffData,
    });
  } catch (err) {
    logger.error("Error in updating profile diff", err);
    throw err;
  }
};

module.exports = {
  add,
  update,
};
