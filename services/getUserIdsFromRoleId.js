const firestore = require("../utils/firestore");
const memberRoleModel = firestore.collection("member-group-roles");
const usersModel = firestore.collection("users");

export const getUserIdsFromRoleId = async (roleId) => {
  let discordIds = [];
  const querySnapshot = await memberRoleModel.where("roleid", "==", roleId).get();
  if (!querySnapshot.empty) {
    discordIds = querySnapshot.docs.map((doc) => doc.data());
  }

  const discordIdsPromiseArray = discordIds.map(async (item) => {
    const userSnapshot = await usersModel.where("discordId", "==", item.userid).get();
    if (!userSnapshot.empty) {
      return userSnapshot.docs[0].id;
    }
    return undefined;
  });
  const userIdsFromDiscordIds = await Promise.all(discordIdsPromiseArray);
  return userIdsFromDiscordIds;
};
