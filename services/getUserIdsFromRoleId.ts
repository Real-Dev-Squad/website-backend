const firestore = require("../utils/firestore");
const memberRoleModel = firestore.collection("member-group-roles");

export const getUserIdsFromRoleId = async (roleId) => {
  let userIds = [];
  try {
    const querySnapshot = await memberRoleModel.where("roleid", "==", roleId).get();
    if (!querySnapshot.empty) {
      userIds = querySnapshot.docs.map((doc) => doc.data().userid);
    }
    return userIds;
  } catch (error) {
    logger.error("error", error);
    throw error;
  }
};
