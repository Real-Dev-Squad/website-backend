const { NotFound } = require("http-errors");
const { userState } = require("../constants/userStatus");
const firestore = require("../utils/firestore");
const {
  getTommorowTimeStamp,
  filterStatusData,
  generateAlreadyExistingStatusResponse,
  updateCurrentStatusToState,
  updateFutureStatusToState,
  createUserStatusWithState,
  getUserIdFromUserName,
  checkIfUserHasLiveTasks,
  generateErrorResponse,
} = require("../utils/userStatus");
const userStatusModel = firestore.collection("usersStatus");
const tasksModel = firestore.collection("tasks");

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
 * @param newStatusData { Object }: Data to be Updated
 * @returns Promise<userStatusModel|Object>
 */

const updateUserStatus = async (userId, newStatusData) => {
  try {
    const userStatusDocs = await userStatusModel.where("userId", "==", userId).limit(1).get();
    const [userStatusDoc] = userStatusDocs.docs;
    const tommorow = getTommorowTimeStamp();
    if (userStatusDoc) {
      const docId = userStatusDoc.id;
      const userStatusData = userStatusDoc.data();
      if (Object.keys(newStatusData).includes("currentStatus")) {
        const newUserState = newStatusData.currentStatus.state;
        const isNewStateOoo = newUserState === userState.OOO;
        const isNewStateNotOoo = newUserState === userState.ACTIVE || newUserState === userState.IDLE;
        const isCurrentStateOoo = userStatusData.currentStatus?.state === userState.OOO;
        const isFutureStateNotOoo =
          userStatusData.futureStatus?.state === userState.ACTIVE ||
          userStatusData.futureStatus?.state === userState.IDLE;

        filterStatusData(newStatusData);
        if (isCurrentStateOoo && isFutureStateNotOoo && isNewStateNotOoo) {
          newStatusData.futureStatus = {};
        }
        if (isNewStateOoo) {
          if (newStatusData.currentStatus.from >= tommorow) {
            newStatusData.futureStatus = { ...newStatusData.currentStatus };
            delete newStatusData.currentStatus;
          } else {
            newStatusData.futureStatus = {};
          }
        }
      }
      await userStatusModel.doc(docId).update(newStatusData);
      return { id: docId, userStatusExists: true, data: newStatusData };
    } else {
      // the user doc doesnt exist meaning we need to create one
      if (Object.keys(newStatusData).includes("currentStatus")) {
        filterStatusData(newStatusData);
        const isNewStateOOO = newStatusData.currentStatus.state === userState.OOO;
        if (isNewStateOOO) {
          if (newStatusData.currentStatus.from >= tommorow) {
            newStatusData.futureStatus = { ...newStatusData.currentStatus };
            delete newStatusData.currentStatus;
          }
        }
      }
      const { id } = await userStatusModel.add({ userId, ...newStatusData });
      return { id, userStatusExists: false, data: newStatusData };
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

/**
 * Updates the user status based on a new task assignment.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{
 *   status: string,
 *   message: string,
 *   data?: object
 * }>} - The response object indicating the status of the user status update.
 * @throws {Error} If there is an error retrieving or updating the user status.
 */
const updateUserStatusOnNewTaskAssignment = async (userId) => {
  try {
    let latestStatusData;
    try {
      latestStatusData = await getUserStatus(userId);
    } catch (error) {
      logger.error("Unable to retrieve the current status" + error.message);
      throw new Error("Unable to retrieve the current status");
    }
    const { userStatusExists } = latestStatusData;
    if (!userStatusExists) {
      return createUserStatusWithState(userId, userStatusModel, userState.ACTIVE);
    }
    const {
      data: {
        currentStatus: { state },
      },
    } = latestStatusData;
    if (state === userState.ACTIVE) {
      return generateAlreadyExistingStatusResponse(userState.ACTIVE);
    } else if (state === userState.IDLE || state === userState.ONBOARDING) {
      return updateCurrentStatusToState(userStatusModel, latestStatusData, userState.ACTIVE);
    } else if (state === userState.OOO) {
      return updateFutureStatusToState(userStatusModel, latestStatusData, userState.ACTIVE);
    }
    throw new Error("Please reach out to the administrator as your user status is not recognized as valid.");
  } catch (error) {
    logger.error(`Error while updating the status for ${userId} - ${error.message}`);
    throw error;
  }
};

/**
 * Updates the user status based on a task update.
 * @param {string} userName - The username associated with the user.
 * @returns {Promise<{
 *   status: number,
 *   message: string,
 *   error: string,
 * } | {
 *   status: string,
 *   message: string,
 *   data: object
 * }>} - The response object indicating the status of the user status update or an error.
 */

const updateUserStatusOnTaskUpdate = async (userName) => {
  let userId;
  let userStatusUpdate;
  try {
    userId = await getUserIdFromUserName(userName);
    userStatusUpdate = await updateUserStatusOnNewTaskAssignment(userId);
    return userStatusUpdate;
  } catch (error) {
    if (error instanceof NotFound) {
      return {
        status: 404,
        error: "Not Found",
        message: error.message,
      };
    }
    return {
      status: 500,
      error: "Internal Server Error",
      message: error.message,
    };
  }
};

const updateStatusOnTaskCompletion = async (userId) => {
  try {
    const hasActiveTask = await checkIfUserHasLiveTasks(userId, tasksModel);
    const latestStatusData = await getUserStatus(userId);
    const { userStatusExists } = latestStatusData;
    if (!userStatusExists) {
      if (hasActiveTask) {
        return createUserStatusWithState(userId, userStatusModel, userState.ACTIVE);
      } else {
        return createUserStatusWithState(userId, userStatusModel, userState.IDLE);
      }
    }
    const {
      data: {
        currentStatus: { state },
      },
    } = latestStatusData;
    if (hasActiveTask) {
      if (state === userState.OOO) {
        return updateFutureStatusToState(userStatusModel, latestStatusData, userState.ACTIVE);
      } else {
        if (state === userState.ACTIVE) {
          return generateAlreadyExistingStatusResponse(userState.ACTIVE);
        }
        return updateCurrentStatusToState(userStatusModel, latestStatusData, userState.ACTIVE);
      }
    } else {
      if (state === userState.OOO) {
        return updateFutureStatusToState(userStatusModel, latestStatusData, userState.IDLE);
      } else {
        if (state === userState.IDLE) {
          return generateAlreadyExistingStatusResponse(userState.IDLE);
        }
        return updateCurrentStatusToState(userStatusModel, latestStatusData, userState.IDLE);
      }
    }
  } catch (error) {
    return generateErrorResponse(error.message);
  }
};

module.exports = {
  deleteUserStatus,
  getUserStatus,
  getAllUserStatus,
  updateUserStatus,
  updateAllUserStatus,
  updateUserStatusOnNewTaskAssignment,
  updateUserStatusOnTaskUpdate,
  updateStatusOnTaskCompletion,
};
