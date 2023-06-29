const firestore = require("../utils/firestore");
const usersCollection = firestore.collection("users");
const { NotFound } = require("http-errors");
const { userState } = require("../constants/userStatus");

/* returns the User Id based on the route path
 *  @param req {Object} : Express request object
 *  @returns userId {Number | undefined} : the user id incase it exists
 */
const getUserIdBasedOnRoute = (req) => {
  let userId;
  if (req.route.path === "/self") {
    userId = req.userData.id;
  } else {
    userId = req.params.userId;
  }
  return userId;
};

/* returns the timestamp for the next day at midnight
 *  @param None
 *  @returns timeStamp : timestamp for the next day at midnight
 */
const getTommorowTimeStamp = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/* returns the timestamp for today at midnight
 *  @param None
 *  @returns timeStamp : timestamp for today at midnight
 */
const getTodayTimeStamp = () => {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today.getTime();
};

/* modifies the data in the newStatusData object based on current State
 *  @param newStatusData : object containing the currentStatus object
 *  @returns None
 */
const filterStatusData = (newStatusData) => {
  const newUserState = newStatusData.currentStatus.state;
  const isNewStateOOO = newUserState === userState.OOO;
  const isNewStateActive = newUserState === userState.ACTIVE;
  if (!isNewStateOOO) {
    newStatusData.currentStatus.until = "";
  }
  if (isNewStateActive) {
    newStatusData.currentStatus.message = "";
  }
};

/**
 * Returns the Response for the Active State
 * @param None
 * @returns {Object} A successful response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string representing the message about the current status
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 */
const handleAlreadyActiveStatusResponse = () => {
  return {
    status: "success",
    message: `The status is already ${userState.ACTIVE}`,
    data: {
      currentStatus: userState.ACTIVE,
    },
  };
};

/**
 * Returns the Response for the Update to Active State
 * @param id The id of the user status document
 * @param data The object containing the current status data
 * @param currentTimeStamp The Current time stamp
 * @returns {Response} The Response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string describing the update was successful
 * - collection: The collection containing the status data
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 *  - previousStatus: The string representing the previous status
 * @throws {Error} If there is an error while updating the status
 */
const updateCurrentStatusToActive = async (id, data, collection, currentTimeStamp) => {
  const { currentStatus, ...docData } = data;
  const updatedStatusData = {
    ...docData,
    currentStatus: {
      state: userState.ACTIVE,
      message: "",
      from: currentTimeStamp,
      until: "",
      updatedAt: currentTimeStamp,
    },
  };
  try {
    await collection.doc(id).update(updatedStatusData);
  } catch (err) {
    logger.error(`error updating status for user id ${data.userId} - ${err.message}`);
    throw new Error(`error updating the current status.`);
  }

  return {
    status: "success",
    message: `The status has been updated to ${userState.ACTIVE}`,
    data: {
      previousStatus: currentStatus.state,
      currentStatus: userState.ACTIVE,
    },
  };
};

/**
 * Returns the Response for the Future Status Update to Active State
 * @param id The id of the user status document
 * @param data The object containing the current status data
 * @param collection The collection containing the status data
 * @param currentTimeStamp The Current time stamp
 * @returns {Response} The Response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string describing the update was successful
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 *  - futureStatus: The string representing the future status
 * @throws {Error} If there is an error while updating the status
 */
const updateFutureStatusToActive = async (id, data, collection, currentTimeStamp) => {
  const { currentStatus, ...docData } = data;
  const updatedStatusData = {
    ...docData,
    currentStatus,
    futureStatus: {
      state: userState.ACTIVE,
      message: "",
      from: currentStatus.until,
      until: "",
      updatedAt: currentTimeStamp,
    },
  };
  try {
    await collection.doc(id).update(updatedStatusData);
  } catch (err) {
    logger.error(`error updating the future status for user id ${data.userId} - ${err.message}`);
    throw new Error(`error updating the future status.`);
  }
  return {
    status: "success",
    message: `As the user is currently ${userState.OOO}, the future status has been updated to ${userState.ACTIVE}.`,
    data: {
      currentStatus: userState.OOO,
      futureStatus: userState.ACTIVE,
    },
  };
};

/**
 * Returns the Response for the New User Status Creation Document
 * @param userId The id of the user
 * @param collection The collection containing the status data
 * @param currentTimeStamp The Current time stamp
 * @returns {Response} The Response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string describing the update was successful
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 * @throws {Error} If there is an error while creating the status
 */

const createStatusAsActive = async (userId, collection, currentTimeStamp) => {
  try {
    await collection.add({
      userId,
      currentStatus: {
        state: userState.ACTIVE,
        message: "",
        from: currentTimeStamp,
        until: "",
        updatedAt: currentTimeStamp,
      },
    });
  } catch (err) {
    logger.error(`error creating the current status for user id ${userId} - ${err.message}`);
    throw new Error("Status Creation Failed.");
  }
  return {
    status: "success",
    message:
      "UserStatus Document did not previously exist, New UserStatus Document created and updated to an active status.",
    data: {
      currentStatus: userState.ACTIVE,
    },
  };
};

async function getUserIdFromUserName(userName) {
  let userSnapShot;
  try {
    userSnapShot = await usersCollection.where("username", "==", userName).limit(1).get();
  } catch (error) {
    logger.error(`Couldn't get user snapshot for ${userName} ${error.message}`);
    throw new Error(`Something went wrong. The User ${userName} couldn't be verified.`);
  }
  if (!userSnapShot.size) {
    throw new NotFound(`Something went wrong. Username ${userName} could not be found.`);
  }
  const [userDoc] = userSnapShot.docs;
  return userDoc.id;
}

module.exports = {
  getUserIdBasedOnRoute,
  getTommorowTimeStamp,
  getTodayTimeStamp,
  filterStatusData,
  handleAlreadyActiveStatusResponse,
  updateCurrentStatusToActive,
  updateFutureStatusToActive,
  createStatusAsActive,
  getUserIdFromUserName,
};
