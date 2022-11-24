const { userState } = require("../constants/userStatus");
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
      return { userStatusExisted: true, userStatusDeleted: true };
    }
  } catch (error) {
    logger.error(`error in deleting User Status Document . Reason - ${error}`);
  }
  return { userStatusExisted: false, userStatusDeleted: false };
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
      return { userId, ...data, userStatusExists: true };
    }
  } catch (error) {
    logger.error(`error in fetching the User Status Document. Reason - ${error}`);
  }
  return { userId, userStatusExists: false };
};

/**
 * @returns {Promise<userStatusModel|Array>} : returns an array of all the userStatus
 */
const getAllUserStaus = async (query) => {
  const allUserStatus = [];
  try {
    let data;
    if (!query.state) {
      data = await userStatusModel.get();
    } else {
      data = await userStatusModel.where("currentStatus.state", "==", query.state).get();
    }
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
    logger.error(`error in fetching the User Status of all Users. ${error}`);
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
      if (Object.keys(updatedData).includes("currentStatus")) {
        const updatedUserState = updatedData.currentStatus.state;
        const isUserOOO = updatedUserState === userState.OOO;
        const isUserActive = updatedUserState === userState.ACTIVE;

        if (!isUserOOO) {
          updatedData.currentStatus.until = "";
        }
        if (isUserActive) {
          updatedData.currentStatus.message = "";
        }
      }
      await userStatusModel.doc(id).update({
        ...updatedData,
      });
      return { userStatusExists: true, userStatusUpdated: true };
    }
  } catch (error) {
    logger.error(`error in deleting User Status Document ${error}`);
  }
  return { userStatusExists: false, userStatusUpdated: false };
};

module.exports = { addUserStatus, deleteUserStatus, getUserStaus, getAllUserStaus, updateUserStatus };
