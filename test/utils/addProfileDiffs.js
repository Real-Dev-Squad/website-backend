import firestore from "../../utils/firestore.js";
import getProfileDiffs from "../fixtures/profileDiffs/profileDiffs.js";

export const profileDiffsModel = firestore.collection("profileDiffs");

export default async (userId) => {
  const PROFILE_DIFFS = getProfileDiffs();
  const addPromises = PROFILE_DIFFS.map((profileDiff) => profileDiffsModel.add({ ...profileDiff, userId }));
  await Promise.all(addPromises);
};
