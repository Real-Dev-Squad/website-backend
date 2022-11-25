const { userState } = require("../constants/userStatus");
const firestore = require("../utils/firestore");
const userStatusModel = firestore.collection("userStatus");

/**
 * @param userId {string} : id of the user
 * @returns {Promise<userStatusModel|string>} : returns id of the deleted userStatus
 */
const deleteUserStatus = async (userId) => {
  try {
    const userStatusDocs = await userStatusModel.where("userId", "==", userId).limit(1).get();
    const [userStatusDoc] = userStatusDocs.docs;
    if (userStatusDoc) {
      const docId = userStatusDoc.id;
      await userStatusModel.doc(docId).delete();
      return { id: userStatusDoc.id, userStatusExisted: true, userStatusDeleted: true };
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
const getUserStatus = async (userId) => {
  try {
    const userStatusDocs = await userStatusModel.where("userId", "==", userId).limit(1).get();
    const [userStatusDoc] = userStatusDocs.docs;
    if (userStatusDoc) {
      const id = userStatusDoc.id;
      const data = userStatusDoc.data();
      return { id, userId, ...data, userStatusExists: true };
    }
  } catch (error) {
    logger.error(`error in fetching the User Status Document. Reason - ${error}`);
  }
  return { id: undefined, userId, userStatusExists: false };
};

/**
 * @returns {Promise<userStatusModel|Array>} : returns an array of all the userStatus
 */
const getAllUserStatus = async (query) => {
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
    const userStatusDocs = await userStatusModel.where("userId", "==", userId).limit(1).get();
    const [userStatusDoc] = userStatusDocs.docs;
    if (userStatusDoc) {
      const docId = userStatusDoc.id;
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
      await userStatusModel.doc(docId).update(updatedData);
      return { id: docId, userStatusExists: true, userStatusUpdated: true, ...updatedData };
    } else {
      // the user doc doesnt exist meaning we need to create one
      if ("currentStatus" in updatedData && "monthlyHours" in updatedData) {
        const { id } = await userStatusModel.add({ userId, ...updatedData });
        return { id, userId, userStatusExists: false, userStatusUpdated: true, ...updatedData };
      } else {
        return { id: undefined, userStatusExists: false, userStatusUpdated: false };
      }
    }
  } catch (error) {
    logger.error(`error in updating User Status Document ${error}`);
  }
  return { id: undefined, userStatusExists: false, userStatusUpdated: false };
};

module.exports = { deleteUserStatus, getUserStatus, getAllUserStatus, updateUserStatus };
