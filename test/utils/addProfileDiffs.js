const firestore = require("../../utils/firestore");
const profileDiffsModel = firestore.collection("profileDiffs");

const getProfileDiffs = require("../fixtures/profileDiffs/profileDiffs");

module.exports = async (userId) => {
  const PROFILE_DIFFS = getProfileDiffs();
  const addPromises = PROFILE_DIFFS.map((profileDiff) => profileDiffsModel.add({ ...profileDiff, userId }));
  await Promise.all(addPromises);
};
