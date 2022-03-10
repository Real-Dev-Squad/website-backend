// const users = require("../../models/");
const firestore = require("../../utils/firestore");
const badgesModel = firestore.collection("badges");
// Import fixtures
const badgesDataArray = require("../fixtures/badges/badges")();

/**
 * Adds badges data
 *
 * @param data { Object }: badges data object to be stored in DB
 * @return {Promise<{badgesInfo: string}>}
 */
module.exports = async ({ userID, data }) => {
  const users = [userID];
  const badgetData = {
    ...(data || badgesDataArray[0]),
    users,
  };
  const badgesInfo = await badgesModel.add(badgetData);
  return {
    badgesInfo,
  };
};
