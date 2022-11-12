const firestore = require("../utils/firestore");
const userStatusModel = firestore.collection("userStatus");
/**
 * @param userStatusData {obj} : data of the status
 * @returns {Promise<userStatusModel|Object>}
 */

const addUserStatus = async (userStatusData) => {
  try {
    const { id } = await userStatusModel.add(userStatusData);
    return { id, userStatusData };
  } catch (error) {
    logger.error("Error in adding user status", error);
    throw error;
  }
};

/**
 * @param userId {string} : id of the user
 * @returns {Promise<userStatusModel|string>} : returns id of the deleted userStatus
 */
const deleteUserStatus = async (userId) => {
  try {
    const docs = await userStatusModel.where("userId", "==", userId).limit(1).get();
    let docId;
    if (docs._size > 0) {
      docs.forEach((docData) => {
        docId = docData.id;
      });
      await userStatusModel.doc(docId).delete();
      return { userId };
    }
  } catch (error) {
    logger.error(`error in deleting User Status Document . Reason - ${error}`);
  }
  return { message: `No UserStatus for ${userId} found.` };
};

/**
 * @params userId {string} : id of the user
 * @returns {Promise<userStatusModel|Object>} : returns the userStatus of a single user
 */
const getUserStaus = async (userId) => {
  try {
    const docs = await userStatusModel.where("userId", "==", userId).limit(1).get();
    if (docs._size > 0) {
      let data = {};
      docs.forEach((docData) => {
        data = docData.data();
      });
      return { userId, ...data };
    }
  } catch (error) {
    logger.error(`error in fetching the User Status Document. Reason - ${error}`);
  }
  return { message: "User not found", userId, data: null };
};

/**
 * @returns {Promise<userStatusModel|Array>} : returns an array of all the userStatus
 */
const getAllUserStaus = async () => {
  const allUserStatus = [];
  try {
    const data = await userStatusModel.get();
    data.forEach((doc) => {
      const currentUserStatus = {
        id: doc.id,
        userId: doc.data().userId,
        currentStatus: doc.data().currentStatus,
        monthlyHours: doc.data().monthlyHours,
      };
      allUserStatus.push(currentUserStatus);
    });
  } catch (error) {
    logger.error(`error in fetching the User Status of all Users. Reason - ${error}`);
  }
  return { allUserStatus };
};

/**
 * @param userId { String }: Id of the User
 * @param updatedData { Object }: Data to be Updated
 * @returns Promise<userStatusModel|Object>
 */

const updateUserStatus = async (userId, updatedData) => {
  try {
    const docs = await userStatusModel.where("userId", "==", userId).limit(1).get();
    if (docs._size > 0) {
      let id;
      docs.forEach((docData) => {
        id = docData.id;
      });
      await userStatusModel.doc(id).update({
        ...updatedData,
      });
      return { userId };
    }
  } catch (error) {
    logger.error(`error in deleting User Status Document . Reason - ${error}`);
  }
  return { userId, message: `user Status not found for ${userId}` };
};

module.exports = { addUserStatus, deleteUserStatus, getUserStaus, getAllUserStaus, updateUserStatus };
