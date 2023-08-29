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
const getTomorrowTimeStamp = () => {
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
 * Generates new status data based on the isActive flag.
 *
 * @param {boolean} isActive - Indicates if the user is active or not.
 * @returns {object} - The generated status data object.
 */
const generateNewStatus = (isActive) => {
  const currentTimeStamp = new Date().getTime();

  const newStatusData = {
    currentStatus: {
      message: "",
      from: currentTimeStamp,
      until: "",
      updatedAt: currentTimeStamp,
    },
  };

  if (isActive) {
    newStatusData.currentStatus.state = "ACTIVE";
  } else {
    newStatusData.currentStatus.state = "IDLE";
  }
  return newStatusData;
};

/**
 * Returns the Response for the Active State
 * @param state The already existing state
 * @returns {Object} A successful response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string representing the message about the current status
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 */
const generateAlreadyExistingStatusResponse = (state) => {
  return {
    status: "success",
    message: `The status is already ${state}`,
    data: {
      currentStatus: state,
    },
  };
};

/**
 * Returns the Response for the Update to Active State
 * @param collection The Collection to update
 * @param latestStatusData The latest data stored in the collection
 * @param newState The Updated state for the new Status
 * @returns {Response} The Response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string describing the update was successful
 * - collection: The collection containing the status data
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 *  - previousStatus: The string representing the previous status
 * @throws {Error} If there is an error while updating the status
 */
const updateCurrentStatusToState = async (collection, latestStatusData, newState) => {
  const {
    id,
    data: {
      currentStatus: { state },
      ...docData
    },
  } = latestStatusData;
  const currentTimeStamp = new Date().getTime();
  const updatedStatusData = {
    ...docData,
    currentStatus: {
      state: newState,
      message: "",
      from: currentTimeStamp,
      until: "",
      updatedAt: currentTimeStamp,
    },
  };
  try {
    await collection.doc(id).update(updatedStatusData);
  } catch (err) {
    logger.error(`error updating status for user id ${docData.userId} - ${err.message}`);
    throw new Error(`error updating the current status.`);
  }

  return {
    status: "success",
    message: `The status has been updated to ${newState}`,
    data: {
      previousStatus: state,
      currentStatus: newState,
    },
  };
};

/**
 * Returns the Response for the Future Status Update to Active State
 * @param collection The Collection to update
 * @param latestStatusData The latest data stored in the collection
 * @param newState The Updated state for the new Status
 * @returns {Response} The Response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string describing the update was successful
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 *  - futureStatus: The string representing the future status
 * @throws {Error} If there is an error while updating the status
 */
const updateFutureStatusToState = async (collection, latestStatusData, newState) => {
  const {
    id,
    data: { futureStatus, ...docData },
  } = latestStatusData;
  const {
    currentStatus: { state, until },
  } = docData;
  const currentTimeStamp = new Date().getTime();
  const updatedStatusData = {
    ...docData,
    futureStatus: {
      state: newState,
      message: "",
      from: until,
      until: "",
      updatedAt: currentTimeStamp,
    },
  };
  try {
    await collection.doc(id).update(updatedStatusData);
  } catch (err) {
    logger.error(`error updating the future status for user id ${docData.userId} - ${err.message}`);
    throw new Error(`error updating the future status.`);
  }
  return {
    status: "success",
    message: `As the user is currently ${state}, the future status has been updated to ${newState}.`,
    data: {
      currentStatus: state,
      futureStatus: newState,
    },
  };
};

/**
 * Returns the Response for the New User Status Creation Document
 * @param userId The id of the user
 * @param collection The collection containing the status data
 * @param state The new state of the user status document
 * @returns {Response} The Response object containing the properties
 * - status: The string representing the call was successful
 * - message: The string describing the update was successful
 * - data: The object containing the details of current status
 *  - currentStatus: The string representing the current status
 * @throws {Error} If there is an error while creating the status
 */

const createUserStatusWithState = async (userId, collection, state) => {
  const currentTimeStamp = new Date().getTime();
  try {
    await collection.add({
      userId,
      currentStatus: {
        state,
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
    message: `UserStatus Document did not previously exist, New UserStatus Document created and updated to an ${state} status.`,
    data: {
      currentStatus: state,
    },
  };
};

/**
 * Retrieves the user ID based on the given username.
 * @param {string} userName - The username to search for.
 * @param {FireStore Object} usersCollection - The FireStore Collection to search for.
 * @returns {Promise<string>} - The user ID corresponding to the given username.
 * @throws {Error} - If there is an error retrieving the user snapshot.
 * @throws {NotFound} - If the username could not be found.
 */
async function getUserIdFromUserName(userName, usersCollection) {
  let userSnapShot;
  try {
    userSnapShot = await usersCollection.where("username", "==", userName).get();
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

/**
 * Checks if a user has any active tasks.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user has active tasks.
 * @throws {Error} - If an error occurs during the query.
 */

const checkIfUserHasLiveTasks = async (userId, tasksModel) => {
  const liveTasksState = ["ASSIGNED", "IN_PROGRESS"];
  let liveTasksSnapshot;
  try {
    liveTasksSnapshot = await tasksModel.where("assignee", "==", userId).where("status", "in", liveTasksState).get();
  } catch (err) {
    logger.error(`An error occurred while querying ${liveTasksState.join(",")} tasks:`, err);
    throw err;
  }
  return liveTasksSnapshot.size > 0;
};

/**
 * Generates the error response message
 *
 * @param {string} message - the error message to respond with
 * @returns {object} - The generated response object.
 */
const generateErrorResponse = (message) => {
  return {
    status: 500,
    error: "Internal Server Error",
    message: message,
  };
};

const getNextDayTimeStamp = (timeStamp) => {
  const currentDateTime = new Date(timeStamp);
  const nextDateDateTime = new Date(currentDateTime);
  nextDateDateTime.setDate(currentDateTime.getDate() + 1);
  nextDateDateTime.setUTCHours(0, 0, 0, 0);
  return nextDateDateTime.getTime();
};

module.exports = {
  getUserIdBasedOnRoute,
  getTomorrowTimeStamp,
  getTodayTimeStamp,
  filterStatusData,
  generateAlreadyExistingStatusResponse,
  updateCurrentStatusToState,
  updateFutureStatusToState,
  createUserStatusWithState,
  getUserIdFromUserName,
  checkIfUserHasLiveTasks,
  generateErrorResponse,
  generateNewStatus,
  getNextDayTimeStamp,
};
