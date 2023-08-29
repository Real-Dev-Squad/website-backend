const { NotFound } = require("http-errors");
const { userState, month, discordNicknameLength, ONE_DAY_IN_MS } = require("../constants/userStatus");
const userStatusServices = require("../services/usersStatusService");
const userServices = require("../services/users");
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

/**
 * Generates discord nickname for a user
 *
 * @param {string} username - The discord username of the user.
 * @returns {string} - Nickname of the user.
 */
const generateOOONickname = (username, from, until) => {
  if (!from && !until) return username;
  const untilDate = new Date(Number(until));
  const untilDay = untilDate.getDate();
  const untilMonth = month[untilDate.getMonth()];

  let oooMessage;

  if (from && until) {
    const fromDate = new Date(Number(from));
    const fromDay = fromDate.getDate();
    const fromMonth = month[fromDate.getMonth()];

    oooMessage = `(OOO ${fromMonth} ${fromDay} - ${untilMonth} ${untilDay})`;
  } else {
    oooMessage = `(OOO ${untilMonth} ${untilDay})`;
  }

  // the max length of the nickname should be discord nickname length limit - OOO message length
  // the extra 1 is for the space between ooo date and the nickname
  const nicknameLen = discordNicknameLength - oooMessage.length - 1;
  return `${username.substring(0, nicknameLen)} ${oooMessage}`;
};

/**
 * @param userId { string }: Id of the User
 * @param status { object: { from?: number, until: number }}: OOO date object
 * @returns Promise<object>
 */
const updateNickname = async (userId, status = {}) => {
  try {
    const { discordId, username } = await userServices.getUserDiscordIdUsername(userId);
    try {
      const nickname =
        status.from || status.until ? generateOOONickname(username, status.from, status.until) : username;

      await userStatusServices.updateDiscordUserNickname(discordId, nickname);
    } catch (err) {
      logger.error("Failed to update user's nickname");
    }
  } catch (err) {
    logger.error(`Failed to get discord id and username for user with id ${userId}`);
    throw err;
  }
};

const updateUsersDiscordNicknameBasedOnStatus = async (usersNicknameUpdates) => {
  let errorsLen = 0;
  try {
    const updates = await Promise.allSettled(usersNicknameUpdates);
    for (const update of updates) {
      if (update.status === "rejected") {
        errorsLen++;
      }
    }

    if (errorsLen) {
      throw new Error(`Error updating ${errorsLen} users' nickname`);
    }
  } catch (err) {
    logger.error("Error updating user's nickname", err);
  }
};

const updateUserStatusFields = async (userStatusDocs = [], summary = {}) => {
  const today = new Date().getTime();
  const updatedUserStatusDocs = [];
  const nicknameUpdates = [];

  userStatusDocs.forEach((document) => {
    const doc = document.data();
    const docRef = document.ref;
    const newStatusData = { ...doc };

    let toUpdate = false;
    const { futureStatus, currentStatus, userId } = doc;
    const { state: futureState } = futureStatus;

    if (futureState === "ACTIVE" || futureState === "IDLE") {
      if (today >= futureStatus.from) {
        // OOO period is over and we need to update their current status
        nicknameUpdates.push(updateNickname(userId));
        newStatusData.currentStatus = { ...futureStatus, until: "", updatedAt: today };

        delete newStatusData.futureStatus;
        toUpdate = !toUpdate;
        summary.oooUsersAltered++;
      } else {
        summary.oooUsersUnaltered++;
        // current status is OOO and we need to update the user's nickname
        nicknameUpdates.push(updateNickname(userId, currentStatus));
      }
    } else {
      // futureState is OOO
      if (today > futureStatus.until) {
        // the OOO period is over
        // change nickname back to the original discord username if the current status is not OOO
        nicknameUpdates.push(updateNickname(userId));
        delete newStatusData.futureStatus;
        toUpdate = !toUpdate;
        summary.nonOooUsersAltered++;
      } else if (today <= doc.futureStatus.until && today >= doc.futureStatus.from) {
        // the current date i.e today lies in between the from and until so we need to swap the status
        // change nickname here to OOO
        nicknameUpdates.push(updateNickname(userId, futureStatus));

        let newCurrentStatus = {};
        let newFutureStatus = {};
        newCurrentStatus = { ...futureStatus, updatedAt: today };
        if (currentStatus?.state) {
          newFutureStatus = { ...currentStatus, from: futureStatus.until, updatedAt: today };
        }
        newStatusData.currentStatus = newCurrentStatus;
        newStatusData.futureStatus = newFutureStatus;
        toUpdate = !toUpdate;
        summary.nonOooUsersAltered++;
      } else {
        // if today < future OOO status's from date
        // remove OOO if there in user's name
        // if future OOO state and today has a difference of 3 days or lesser
        const threeDaysAfterToday = today + ONE_DAY_IN_MS * 3;
        if (threeDaysAfterToday >= futureStatus.from) {
          // update the status of user to OOO
          nicknameUpdates.push(updateNickname(userId, futureStatus));
        } else nicknameUpdates.push(updateNickname(userId));
        summary.nonOooUsersUnaltered++;
      }
    }
    if (toUpdate) {
      updatedUserStatusDocs.push({ ...newStatusData, docRef });
    }
  });

  await updateUsersDiscordNicknameBasedOnStatus(nicknameUpdates);

  return updatedUserStatusDocs;
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
  generateOOONickname,
  updateNickname,
  updateUserStatusFields,
  updateUsersDiscordNicknameBasedOnStatus,
};
