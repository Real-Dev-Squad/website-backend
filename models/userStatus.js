const { userState } = require("../constants/userStatus");
const firestore = require("../utils/firestore");
const { getTommorowTimeStamp } = require("../utils/userStatus");
const userStatusModel = firestore.collection("usersStatus");

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
    } else {
      return { id: null, userStatusExisted: false, userStatusDeleted: false };
    }
  } catch (error) {
    logger.error(`error in deleting User Status Document . Reason - ${error}`);
    throw error;
  }
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
      delete data.userId;
      return { id, data, userStatusExists: true };
    } else {
      return { id: null, data: null, userStatusExists: false };
    }
  } catch (error) {
    logger.error(`Error in fetching the User Status Document. Reason - ${error}`);
    throw error;
  }
};

/**
 * @returns {Promise<userStatusModel|Array>} : returns an array of all the userStatus
 */
const getAllUserStatus = async (query) => {
  try {
    const allUserStatus = [];
    let data;
    if (!query.state) {
      data = await userStatusModel.get();
    } else {
      data = await userStatusModel
        .where("currentStatus.state", "==", query.state)
        .orderBy("currentStatus.from", "asc")
        .get();
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
    return { allUserStatus };
  } catch (error) {
    logger.error(`error in fetching the User Status of all Users. ${error}`);
    throw error;
  }
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
      const userData = userStatusDoc.data();
      if (Object.keys(updatedData).includes("currentStatus")) {
        const updatedUserState = updatedData.currentStatus.state;
        const isUserOOO = updatedUserState === userState.OOO;
        const isUserActive = updatedUserState === userState.ACTIVE;
        const isUserIdle = updatedUserState === userState.IDLE;
        const isUserCurrentlyOOO = userData.currentStatus?.state === userState.OOO;

        const doesUserHasFutureActiveOrIdleStatus =
          userData.futureStatus?.state === userState.ACTIVE || userData.futureStatus?.state === userState.IDLE;
        if (isUserCurrentlyOOO && doesUserHasFutureActiveOrIdleStatus) {
          if (isUserActive || isUserIdle) {
            updatedData.futureStatus = {};
          }
        }

        if (!isUserOOO) {
          updatedData.currentStatus.until = "";
        }
        if (isUserActive) {
          updatedData.currentStatus.message = "";
        }
        if (isUserOOO) {
          const tommorow = getTommorowTimeStamp();
          if (updatedData.currentStatus.from >= tommorow) {
            const futureStatus = { ...updatedData.currentStatus };
            delete updatedData.currentStatus;
            updatedData.futureStatus = futureStatus;
          } else {
            updatedData.futureStatus = {};
          }
        }
      }
      await userStatusModel.doc(docId).update(updatedData);
      return { id: docId, userStatusExists: true, data: updatedData };
    } else {
      // the user doc doesnt exist meaning we need to create one
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
        if (isUserOOO) {
          const tommorow = getTommorowTimeStamp();
          if (updatedData.currentStatus.from >= tommorow) {
            const futureStatus = { ...updatedData.currentStatus };
            delete updatedData.currentStatus;
            updatedData.futureStatus = futureStatus;
          }
        }
      }
      const { id } = await userStatusModel.add({ userId, ...updatedData });
      return { id, userStatusExists: false, data: updatedData };
    }
  } catch (error) {
    logger.error(`error in updating User Status Document ${error}`);
    throw error;
  }
};

/**
 * @param userId { String }: Id of the User
 * @param newStatusData { Object }: Data to be Updated
 * @returns Promise<userStatusModel|Object>
 */

const updateAllUserStatus = async () => {
  try {
    const userStatusDocs = await userStatusModel.where("futureStatus.state", "in", ["ACTIVE", "IDLE", "OOO"]).get();
    const batch = firestore.batch();
    const today = new Date().getTime();
    userStatusDocs.forEach(async (document) => {
      const doc = document.data();
      const docRef = document.ref;
      const newStatusData = { ...doc };
      let toUpdate = false;
      const { futureStatus, currentStatus } = doc;
      const { state: futureState } = futureStatus;
      if (futureState === "ACTIVE" || futureState === "IDLE") {
        if (today >= futureStatus.from) {
          newStatusData.currentStatus = { ...futureStatus, until: "", updatedAt: today };
          newStatusData.futureStatus = {};
          toUpdate = !toUpdate;
        }
      } else {
        if (today > futureStatus.until) {
          newStatusData.futureStatus = {};
          toUpdate = !toUpdate;
        } else if (today <= doc.futureStatus.until && today >= doc.futureStatus.from) {
          let newCurrentStatus = {};
          let newFutureStatus = {};
          newCurrentStatus = { ...futureStatus, updatedAt: today };
          if (currentStatus?.state) {
            newFutureStatus = { ...currentStatus, from: futureStatus.until, updatedAt: today };
          }
          newStatusData.currentStatus = newCurrentStatus;
          newStatusData.futureStatus = newFutureStatus;
          toUpdate = !toUpdate;
        }
      }
      if (toUpdate) {
        batch.set(docRef, newStatusData);
      }
    });
    if (batch._ops.length > 100) {
      logger.info(
        `Warning: More than 100 User Status documents to update. The max limit permissible is 500. Refer https://github.com/Real-Dev-Squad/website-backend/issues/890 for more details.`
      );
    }
    await batch.commit();
    return { status: 204, message: "User Status updated Successfully." };
  } catch (error) {
    logger.error(`error in updating User Status Documents ${error}`);
    return { status: 500, message: "User Status couldn't be updated Successfully." };
  }
};

module.exports = { deleteUserStatus, getUserStatus, getAllUserStatus, updateUserStatus, updateAllUserStatus };
