const { Forbidden, NotFound } = require("http-errors");
const firestore = require("../utils/firestore");
const {
  getTomorrowTimeStamp,
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
} = require("../utils/userStatus");
const { TASK_STATUS } = require("../constants/tasks");
const userStatusModel = firestore.collection("usersStatus");
const tasksModel = firestore.collection("tasks");
const { userState } = require("../constants/userStatus");
const { getGroupRole, addGroupRoleToMember, removeGroupRoleFromMember } = require("./discordactions");
const usersCollection = firestore.collection("users");
const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");
const jwt = require("jsonwebtoken");

const removeGroupRoleFromDiscordUser = async ({ userId, roleName }) => {
  try {
    const groupRole = await getGroupRole(roleName);
    if (groupRole?.roleExists) {
      const user = await usersCollection.doc(userId).get();
      const userData = user.data();
      await removeGroupRoleFromMember({ roleid: groupRole.role.roleid, userid: userData.discordId });
      const dataForDiscord = {
        roleid: groupRole.role.roleid,
        userid: userData.discordId,
      };
      const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
        algorithm: "RS256",
        expiresIn: config.get("rdsServerlessBot.ttl"),
      });

      await fetch(`${DISCORD_BASE_URL}/roles`, {
        method: "DELETE",
        body: JSON.stringify(dataForDiscord),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      }).then((response) => response.json());
    }
  } catch (error) {
    logger.error(`error in removing role from discord user. Reason - ${error}`);
    throw error;
  }
};

const addGroupRoleToDiscordUser = async ({ userId, roleName }) => {
  try {
    const groupRole = await getGroupRole(roleName);
    if (groupRole?.roleExists) {
      const user = await usersCollection.doc(userId).get();
      const userData = user.data();
      await addGroupRoleToMember({ roleid: groupRole.role.roleid, userid: userData.discordId });
      const dataForDiscord = {
        roleid: groupRole.role.roleid,
        userid: userData.discordId,
      };
      const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
        algorithm: "RS256",
        expiresIn: config.get("rdsServerlessBot.ttl"),
      });
      await fetch(`${DISCORD_BASE_URL}/roles/add`, {
        method: "PUT",
        body: JSON.stringify(dataForDiscord),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      }).then((response) => response.json());
    }
  } catch (error) {
    logger.error(`error in adding role to discord user. Reason - ${error}`);
    throw error;
  }
};

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
    const tommorow = getTomorrowTimeStamp();
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
      if (
        userStatusData.currentStatus?.state === userState.IDLE &&
        newStatusData.currentStatus?.state !== userState.IDLE
      ) {
        await removeGroupRoleFromDiscordUser({ userId, roleName: "group-idle" });
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
  const summary = {
    usersCount: 0,
    oooUsersAltered: 0,
    oooUsersUnaltered: 0,
    nonOooUsersAltered: 0,
    nonOooUsersUnaltered: 0,
  };
  try {
    const userStatusDocs = await userStatusModel.where("futureStatus.state", "in", ["ACTIVE", "IDLE", "OOO"]).get();
    summary.usersCount = userStatusDocs._size;
    const batch = firestore.batch();
    const today = new Date().getTime();
    userStatusDocs.forEach(async (document) => {
      const doc = document.data();
      const docRef = document.ref;
      const userId = doc.userId;
      const newStatusData = { ...doc };
      let toUpdate = false;
      const { futureStatus, currentStatus } = doc;
      const { state: futureState } = futureStatus;
      const { state: currentState } = currentStatus;
      if (futureState === "ACTIVE" || futureState === "IDLE") {
        if (today >= futureStatus.from) {
          // OOO period is over and we need to update their current status
          newStatusData.currentStatus = { ...futureStatus, until: "", updatedAt: today };
          delete newStatusData.futureStatus;
          toUpdate = !toUpdate;
          summary.oooUsersAltered++;
        } else {
          summary.oooUsersUnaltered++;
        }
      } else {
        // futureState is OOO
        if (today > futureStatus.until) {
          // the OOO period is over
          delete newStatusData.futureStatus;
          toUpdate = !toUpdate;
          summary.nonOooUsersAltered++;
        } else if (today <= doc.futureStatus.until && today >= doc.futureStatus.from) {
          // the current date i.e today lies in between the from and until so we need to swap the status
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
          summary.nonOooUsersUnaltered++;
        }
      }
      if (toUpdate) {
        if (futureState === userState.IDLE && currentState !== userState.IDLE) {
          await addGroupRoleToDiscordUser({ userId, roleName: "group-idle" });
        } else if (currentState === userState.IDLE && futureState !== userState.IDLE) {
          await removeGroupRoleFromDiscordUser({ userId, roleName: "group-idle" });
        }
        batch.set(docRef, newStatusData);
      }
    });
    if (batch._ops.length > 100) {
      logger.info(
        `Warning: More than 100 User Status documents to update. The max limit permissible is 500. Refer https://github.com/Real-Dev-Squad/website-backend/issues/890 for more details.`
      );
    }
    await batch.commit();
    return summary;
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
    }
    if (state === userState.IDLE || state === userState.ONBOARDING) {
      await removeGroupRoleFromDiscordUser({ userId, roleName: "group-idle" });
      return updateCurrentStatusToState(userStatusModel, latestStatusData, userState.ACTIVE);
    }
    if (state === userState.OOO) {
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
  try {
    const userId = await getUserIdFromUserName(userName, usersCollection);
    const userStatusUpdate = await updateUserStatusOnNewTaskAssignment(userId);
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
        await addGroupRoleToDiscordUser({ userId, roleName: "group-idle" });
        return createUserStatusWithState(userId, userStatusModel, userState.IDLE);
      }
    }
    const {
      data: {
        currentStatus: { state },
      },
    } = latestStatusData;
    if (hasActiveTask) {
      switch (state) {
        case userState.OOO:
          return updateFutureStatusToState(userStatusModel, latestStatusData, userState.ACTIVE);
        case userState.ACTIVE:
          return generateAlreadyExistingStatusResponse(userState.ACTIVE);
        default:
          if (state === userState.IDLE) await removeGroupRoleFromDiscordUser({ userId, roleName: "group-idle" });
          return updateCurrentStatusToState(userStatusModel, latestStatusData, userState.ACTIVE);
      }
    } else {
      switch (state) {
        case userState.OOO:
          return updateFutureStatusToState(userStatusModel, latestStatusData, userState.IDLE);
        case userState.IDLE:
          return generateAlreadyExistingStatusResponse(userState.IDLE);
        default:
          await addGroupRoleToDiscordUser({ userId, roleName: "group-idle" });
          return updateCurrentStatusToState(userStatusModel, latestStatusData, userState.IDLE);
      }
    }
  } catch (error) {
    return generateErrorResponse(error.message);
  }
};

const batchUpdateUsersStatus = async (users) => {
  const currentTimeStamp = new Date().getTime();
  const batch = firestore.batch();
  const summary = {
    usersCount: users.length,
    unprocessedUsers: 0,
    onboardingUsersAltered: 0,
    onboardingUsersUnaltered: 0,
    activeUsersAltered: 0,
    activeUsersUnaltered: 0,
    idleUsersAltered: 0,
    idleUsersUnaltered: 0,
  };

  for (const { userId, state } of users) {
    let latestStatusData;
    try {
      latestStatusData = await getUserStatus(userId);
    } catch (error) {
      summary.unprocessedUsers++;
      continue;
    }
    const { id, userStatusExists, data } = latestStatusData;
    const statusToUpdate = {
      state,
      message: "",
      from: new Date().setUTCHours(0, 0, 0, 0),
      until: "",
      updatedAt: currentTimeStamp,
    };

    if (!userStatusExists || !data?.currentStatus) {
      const newUserStatusRef = userStatusModel.doc();
      const newUserStatusData = {
        userId,
        currentStatus: statusToUpdate,
      };
      state === userState.ACTIVE ? summary.activeUsersAltered++ : summary.idleUsersAltered++;
      if (state === userState.IDLE) await addGroupRoleToDiscordUser({ userId, roleName: "group-idle" });
      batch.set(newUserStatusRef, newUserStatusData);
    } else {
      const {
        currentStatus: { state: currentState, until },
      } = data;
      if (currentState === state) {
        currentState === userState.ACTIVE ? summary.activeUsersUnaltered++ : summary.idleUsersUnaltered++;
        continue;
      } else if (currentState === userState.ONBOARDING) {
        const docRef = userStatusModel.doc(id);
        if (state === userState.ACTIVE) {
          const updatedStatusData = {
            currentStatus: statusToUpdate,
          };
          summary.onboardingUsersAltered++;
          batch.update(docRef, updatedStatusData);
        } else {
          summary.onboardingUsersUnaltered++;
        }
      } else if (currentState === userState.OOO) {
        const docRef = userStatusModel.doc(id);
        state === userState.ACTIVE ? summary.activeUsersAltered++ : summary.idleUsersAltered++;

        const currentDate = new Date();
        const untilDate = new Date(until);

        const timeDifferenceMilliseconds = currentDate.setUTCHours(0, 0, 0, 0) - untilDate.setUTCHours(0, 0, 0, 0);
        const timeDifferenceDays = Math.floor(timeDifferenceMilliseconds / (24 * 60 * 60 * 1000));

        if (timeDifferenceDays >= 1) {
          if (state === userState.IDLE) await addGroupRoleToDiscordUser({ userId, roleName: "group-idle" });
          batch.update(docRef, {
            currentStatus: statusToUpdate,
          });
        } else {
          const getNextDayAfterUntil = getNextDayTimeStamp(until);
          batch.update(docRef, {
            futureStatus: {
              ...statusToUpdate,
              from: getNextDayAfterUntil,
            },
          });
        }
      } else {
        const docRef = userStatusModel.doc(id);
        state === userState.ACTIVE ? summary.activeUsersAltered++ : summary.idleUsersAltered++;
        if (state === userState.IDLE) await addGroupRoleToDiscordUser({ userId, roleName: "group-idle" });
        const updatedStatusData = {
          currentStatus: statusToUpdate,
        };
        batch.update(docRef, updatedStatusData);
      }
    }
  }

  try {
    await batch.commit();
    return summary;
  } catch (error) {
    throw new Error("Batch operation failed");
  }
};

const getTaskBasedUsersStatus = async () => {
  const users = [];
  let totalIdleUsers = 0;
  let totalActiveUsers = 0;
  const unprocessedUsers = [];
  let errorCount = 0;
  let usersSnapshot;
  try {
    usersSnapshot = await usersCollection
      .where("roles.in_discord", "==", true)
      .where("roles.archived", "==", false)
      .get();
  } catch (error) {
    logger.error(`unable to get users ${error.message}`);
    throw new Error("unable to get users");
  }
  const totalUsers = usersSnapshot.size;
  if (totalUsers) {
    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const assigneeId = userDoc.id;
        try {
          const tasksQuerySnapshot = await firestore
            .collection("tasks")
            .where("assignee", "==", assigneeId)
            .where("status", "in", [TASK_STATUS.ASSIGNED, TASK_STATUS.IN_PROGRESS])
            .get();
          if (tasksQuerySnapshot.empty) {
            totalIdleUsers++;
            users.push({ userId: assigneeId, state: userState.IDLE });
          } else {
            totalActiveUsers++;
            users.push({ userId: assigneeId, state: userState.ACTIVE });
          }
        } catch (error) {
          errorCount++;
          unprocessedUsers.push(assigneeId);
          logger.error(`Error retrieving tasks for user ${assigneeId}: ${error.message}`);
        }
      })
    );
  }

  return {
    totalUsers,
    totalIdleUsers,
    totalActiveUsers,
    totalUnprocessedUsers: errorCount,
    unprocessedUsers,
    users,
  };
};

/**
 * Cancels the Out-of-Office (OOO) status for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} - A promise that resolves to an object with cancellation details.
 * @throws {Error} - If there is an error fetching the user status document or updating the status.
 */

const cancelOooStatus = async (userId) => {
  try {
    let userStatusDoc;
    let isActive;
    try {
      userStatusDoc = await userStatusModel.where("userId", "==", userId).get();
    } catch (error) {
      logger.error(`Unable to fetch user status document from the firestore : ${error.message}`);
      throw error;
    }
    if (!userStatusDoc.size) {
      throw new NotFound("No User status document found");
    }
    const [userStatusDocument] = userStatusDoc.docs;
    const docId = userStatusDocument.id;
    const { futureStatus, ...docData } = userStatusDocument.data();
    if (docData.currentStatus.state !== userState.OOO) {
      throw new Forbidden(
        `The ${userState.OOO} Status cannot be canceled because the current status is ${docData.currentStatus.state}.`
      );
    }
    try {
      isActive = await checkIfUserHasLiveTasks(userId, tasksModel);
    } catch (error) {
      logger.error(`Unable to fetch user status based on the task : ${error.message}`);
      throw error;
    }
    const updatedStatus = generateNewStatus(isActive);
    const newStatusData = { ...docData, ...updatedStatus };
    await userStatusModel.doc(docId).update(newStatusData);
    if (!isActive) {
      await addGroupRoleToDiscordUser({ userId, roleName: "group-idle" });
    }
    return { id: docId, userStatusExists: true, data: newStatusData };
  } catch (error) {
    logger.error(`Error while canceling ${userState.OOO} status: ${error.message}`);
    throw error;
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
  batchUpdateUsersStatus,
  getTaskBasedUsersStatus,
  cancelOooStatus,
};
