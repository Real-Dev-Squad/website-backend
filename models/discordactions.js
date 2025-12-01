const { generateDiscordProfileImageUrl } = require("../utils/discord-actions");
const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const discordInvitesModel = firestore.collection("discord-invites");
const admin = require("firebase-admin");
const { findSubscribedGroupIds } = require("../utils/helper");
const { retrieveUsers } = require("../services/dataAccessLayer");
const { BATCH_SIZE_IN_CLAUSE } = require("../constants/firebase");
const { getAllUserStatus, getGroupRole, getUserStatus } = require("./userStatus");
const { normalizeTimestamp } = require("../utils/userStatus");
const { userState, POST_OOO_GRACE_PERIOD_IN_DAYS } = require("../constants/userStatus");
const { ONE_DAY_IN_MS, SIMULTANEOUS_WORKER_CALLS } = require("../constants/users");
const userModel = firestore.collection("users");
const photoVerificationModel = firestore.collection("photo-verification");
const dataAccess = require("../services/dataAccessLayer");
const { getDiscordMembers, addRoleToUser, removeRoleFromUser } = require("../services/discordService");
const discordDeveloperRoleId = config.get("discordDeveloperRoleId");
const discordMavenRoleId = config.get("discordMavenRoleId");
const discordMissedUpdatesRoleId = config.get("discordMissedUpdatesRoleId");

const userStatusModel = firestore.collection("usersStatus");
const usersUtils = require("../utils/users");
const { getUsersBasedOnFilter, fetchUser } = require("./users");
const {
  convertDaysToMilliseconds,
  convertMillisToSeconds,
  convertTimestampToUTCStartOrEndOfDay,
} = require("../utils/time");
const { chunks } = require("../utils/array");
const tasksModel = firestore.collection("tasks");
const { FIRESTORE_IN_CLAUSE_SIZE } = require("../constants/users");
const discordService = require("../services/discordService");
const { buildTasksQueryForMissedUpdates } = require("../utils/tasks");
const { buildProgressQueryForMissedUpdates } = require("../utils/progresses");
const { getRequestByKeyValues } = require("./requests");
const { REQUEST_TYPE, REQUEST_STATE } = require("../constants/requests");
const allMavens = [];

/**
 *
 * @param roleData { Object }: Data of the new role
 * @returns {Promise<discordRoleModel|Object>}
 */

const createNewRole = async (roleData) => {
  try {
    const { id } = await discordRoleModel.add(roleData);
    return { id, roleData };
  } catch (err) {
    logger.error("Error in creating role", err);
    throw err;
  }
};

/**
 * Soft deletes a group role by marking it as deleted in the database.
 * This function updates the role document in Firestore, setting isDeleted to true
 * and recording who deleted it and when.
 *
 * @param {string} groupId - The ID of the group role to be deleted
 * @param {string} deletedBy - The ID of the user performing the deletion for logging purpose
 * @returns {Promise<Object>} An object indicating whether the operation was successful
 */
const deleteGroupRole = async (groupId, deletedBy) => {
  try {
    const roleRef = admin.firestore().collection("discord-roles").doc(groupId);
    await roleRef.update({
      isDeleted: true,
      deletedAt: admin.firestore.Timestamp.fromDate(new Date()),
      deletedBy: deletedBy,
    });

    return { isSuccess: true };
  } catch (error) {
    logger.error(`Error in deleteGroupRole: ${error}`);
    return { isSuccess: false };
  }
};

const removeMemberGroup = async (roleId, discordId) => {
  try {
    const backendResponse = await deleteRoleFromDatabase(roleId, discordId);
    return backendResponse;
  } catch (error) {
    logger.error(`Error while removing role: ${error}`);
    throw new Error(error);
  }
};

const deleteRoleFromDatabase = async (roleId, discordId) => {
  try {
    const rolesToDeleteSnapshot = await memberRoleModel
      .where("userid", "==", discordId)
      .where("roleid", "==", roleId)
      .get();

    if (rolesToDeleteSnapshot.docs.length > 0) {
      const doc = rolesToDeleteSnapshot.docs[0];
      const roleRef = memberRoleModel.doc(doc.id);
      await roleRef.delete();
      return { roleId, wasSuccess: true };
    }
    return { roleId, wasSuccess: false };
  } catch (error) {
    const errorMessage = `Error while deleting role from backend: ${error}`;
    logger.error(errorMessage);
  }
  return false;
};

/**
 * Fetches paginated group roles by page and size.
 *
 * @param {Object} options - Pagination options
 * @param {number} options.offset - Number of items to skip
 * @param {number} options.limit - Maximum number of roles to fetch
 * @returns {Promise<Object>} - Paginated roles and total count
 */
const getPaginatedGroupRolesByPage = async ({ offset, limit }) => {
  try {
    const snapshot = await discordRoleModel.orderBy("date", "desc").offset(offset).limit(limit).get();

    const roles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalSnapshot = await discordRoleModel.get();
    const total = totalSnapshot.size;

    return { roles, total };
  } catch (err) {
    logger.error(`Error in getPaginatedGroupRolesByPage: ${err.message}`);
    throw new Error("Database error while paginating group roles");
  }
};

/**
 *
 * @param roleData { Object }: Data of the new role
 * @returns {Promise<discordRoleModel|Object>}
 */
const getAllGroupRoles = async () => {
  try {
    const data = await discordRoleModel.get();
    const groups = [];
    data.forEach((doc) => {
      const group = {
        id: doc.id,
        ...doc.data(),
      };
      groups.push(group);
    });
    return { groups };
  } catch (err) {
    logger.error("Error in getting all group-roles", err);
    throw err;
  }
};

/**
 *
 * @param groupRoleName String : name of the role
 * @returns {role data}
 */
const getGroupRoleByName = async (groupRoleName) => {
  try {
    const data = await discordRoleModel.where("rolename", "==", groupRoleName).limit(1).get();
    return { data };
  } catch (err) {
    logger.error("Error in getting all group-role", err);
    throw err;
  }
};

/**
 *
 * @param roleData { Object }: Data of the new role
 * @returns {role data}
 */
const updateGroupRole = async (roleData, docId) => {
  try {
    const data = await discordRoleModel.doc(docId).set(roleData, { merge: true });
    return { data };
  } catch (err) {
    logger.error("Error in updating all group-role", err);
    throw err;
  }
};
/**
 *
 * @param options { Object }: Data of the new role
 * @param options.rolename String : name of the role
 * @param options.roleid String : id of the role
 * @returns {Promise<discordRoleModel|Object>}
 */

const isGroupRoleExists = async (options = {}) => {
  try {
    const { groupId = null, rolename = null, roleid = null } = options;

    let existingRoles;
    if (groupId) {
      existingRoles = await discordRoleModel.doc(groupId).get();
      return { roleExists: existingRoles.exists, existingRoles };
    } else if (rolename && roleid) {
      existingRoles = await discordRoleModel
        .where("rolename", "==", rolename)
        .where("roleid", "==", roleid)
        .limit(1)
        .get();
    } else if (rolename) {
      existingRoles = await discordRoleModel.where("rolename", "==", rolename).limit(1).get();
    } else if (roleid) {
      existingRoles = await discordRoleModel.where("roleid", "==", roleid).limit(1).get();
    } else {
      throw Error("Either rolename, roleId, or groupId is required");
    }
    return { roleExists: !existingRoles.empty, existingRoles };
  } catch (err) {
    logger.error("Error in getting all group-roles", err);
    throw err;
  }
};

const getGroupRolesForUser = async (discordId) => {
  try {
    const userRolesSnapshot = await memberRoleModel.where("userid", "==", discordId).get();

    const userRoles = userRolesSnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    const userRolesObject = {
      userId: discordId,
      groups: userRoles.map((userRole) => ({
        roleId: userRole.roleid,
      })),
    };
    return userRolesObject;
  } catch (error) {
    logger.error("Error fetching user roles:", error);
    throw error;
  }
};

/**
 *
 * @param roleData { Object }: Data of the new role
 * @returns {Promise<discordRoleModel|Object>}
 */
const addGroupRoleToMember = async (roleData) => {
  try {
    const alreadyHasRole = await memberRoleModel
      .where("roleid", "==", roleData.roleid)
      .where("userid", "==", roleData.userid)
      .limit(1)
      .get();
    if (!alreadyHasRole.empty) {
      const oldRole = [];
      alreadyHasRole.forEach((role) => oldRole.push(role.data()));
      return { id: oldRole[0].id, roleData: oldRole[0], wasSuccess: false };
    }
    const { id } = await memberRoleModel.add(roleData);
    return { id, roleData, wasSuccess: true };
  } catch (err) {
    logger.error("Error in adding role", err);
    throw err;
  }
};

/**
 *
 * @param userDiscordId { String }: DiscordId of the user
 * @returns {Promise<String>}
 */
const updateDiscordImageForVerification = async (userDiscordId) => {
  try {
    const discordAvatarUrl = await generateDiscordProfileImageUrl(userDiscordId);
    const verificationDataSnapshot = await photoVerificationModel.where("discordId", "==", userDiscordId).get();
    const unverifiedUserDiscordImage = {
      discord: { url: discordAvatarUrl, approved: false, date: admin.firestore.Timestamp.fromDate(new Date()) },
    };
    if (verificationDataSnapshot.empty) {
      throw new Error("No user verification record found");
    }
    const documentRef = verificationDataSnapshot.docs[0].ref;
    await documentRef.update(unverifiedUserDiscordImage);
    return discordAvatarUrl;
  } catch (err) {
    logger.error("Error while updating discord verification image:", err);
    throw err;
  }
};

/**
 * Enriches group data with membership information for a given Discord ID.
 *
 * @param {string} discordId - The Discord ID of the user.
 * @param {Array<object>} groups - Array of group objects to process.
 * @returns {Promise<Array<object>>} - An array of group objects with enriched information.
 */
const enrichGroupDataWithMembershipInfo = async (discordId, groups = []) => {
  try {
    if (!groups.length) {
      return [];
    }

    const groupCreatorIds = groups.reduce((ids, group) => {
      if (group.createdBy) {
        ids.add(group.createdBy);
      }
      return ids;
    }, new Set());

    const groupCreatorsDetails = await retrieveUsers({ userIds: Array.from(groupCreatorIds) });
    const roleIds = groups.map((group) => group.roleid);
    const groupsToUserMappings = await fetchGroupToUserMapping(roleIds);
    const roleIdToCountMap = {};

    groupsToUserMappings.forEach((groupToUserMapping) => {
      // Count how many times roleId comes up in the array.
      // This says how many users we have for a given roleId
      roleIdToCountMap[groupToUserMapping.roleid] = (roleIdToCountMap[groupToUserMapping.roleid] ?? 0) + 1;
    });

    const subscribedGroupIds = findSubscribedGroupIds(discordId, groupsToUserMappings);

    return groups.map((group) => {
      const groupCreator = groupCreatorsDetails.find((user) => user.id === group.createdBy);
      return {
        ...group,
        firstName: groupCreator?.first_name,
        lastName: groupCreator?.last_name,
        image: groupCreator?.picture?.url,
        memberCount: roleIdToCountMap[group.roleid] || 0, // Number of users joined this group
        isMember: subscribedGroupIds.has(group.roleid), // Is current loggedIn user is a member of this group
      };
    });
  } catch (err) {
    logger.error("Error while enriching group data with membership info", err);
    throw err;
  }
};

/**
 *
 * @param {Array<string>} roleIds Array of roleIds whose user mapping needs to fetched
 * @returns Array of roleId to userId mapping
 *
 * Breaking the roleIds array into chunks of 30 or less due to firebase limitation
 */
const fetchGroupToUserMapping = async (roleIds) => {
  try {
    const roleIdChunks = [];

    for (let i = 0; i < roleIds.length; i += BATCH_SIZE_IN_CLAUSE) {
      roleIdChunks.push(roleIds.slice(i, i + BATCH_SIZE_IN_CLAUSE));
    }

    const promises = roleIdChunks.map(async (roleIdChunk) => {
      const querySnapshot = await memberRoleModel.where("roleid", "in", roleIdChunk).get();
      return querySnapshot.docs.map((doc) => doc.data());
    });

    const snapshots = await Promise.all(promises);

    const groupToUserMappingArray = snapshots.flat();

    return groupToUserMappingArray;
  } catch (err) {
    logger.error("Error while fetching group to user mapping", err);
    throw err;
  }
};

const updateIdleUsersOnDiscord = async (dev) => {
  let totalIdleUsers = 0;
  const totalGroupIdleRolesApplied = { count: 0, response: [] };
  const totalGroupIdleRolesNotApplied = { count: 0, errors: [] };
  const totalGroupIdleRolesRemoved = { count: 0, response: [] };
  const totalGroupIdleRolesNotRemoved = { count: 0, errors: [] };
  let totalUsersHavingNoDiscordId = 0;
  let totalArchivedUsers = 0;
  const allIdleUsers = [];
  let allUsersHavingGroupIdle = [];
  let groupIdleRole;
  let groupIdleRoleId;

  try {
    groupIdleRole = await getGroupRole("group-idle");
    groupIdleRoleId = groupIdleRole.role.roleid;
    if (!groupIdleRole.roleExists) throw new Error("Idle Role does not exist");
    const { allUserStatus } = await getAllUserStatus({ state: userState.IDLE });
    const discordUsers = await getDiscordMembers();
    const usersHavingIdleRole = [];
    discordUsers?.forEach((discordUser) => {
      const isDeveloper = discordUser.roles.includes(discordDeveloperRoleId);
      const haveIdleRole = discordUser.roles.includes(groupIdleRole.role.roleid);
      const isMaven = discordUser.roles.includes(discordMavenRoleId);

      if (dev === "true" && isMaven) {
        allMavens.push(discordUser.user.id);
      }

      if (isDeveloper && haveIdleRole) {
        usersHavingIdleRole.push({ userid: discordUser.user.id });
      }
    });
    if (allUserStatus) {
      await Promise.all(
        allUserStatus.map(async (userStatus) => {
          try {
            const userData = await userModel.doc(userStatus.userId).get();
            const isUserArchived = userData.data().roles.archived;
            if (userData.exists) {
              if (isUserArchived) {
                totalArchivedUsers++;
              } else if (dev === "true" && !allMavens.includes(userData.data().discordId)) {
                userStatus.userid = userData.data().discordId;
                allIdleUsers.push(userStatus);
              }
            }
          } catch (error) {
            logger.error(`error updating discordId in userStatus ${error.message}`);
            throw new Error("error updating discordId in userStatus");
          }
        })
      );
    }
    allUsersHavingGroupIdle = usersHavingIdleRole;
  } catch (error) {
    logger.error(`unable to get idle users ${error.message}`);
    throw new Error("unable to get idle users");
  }

  const getUniqueInFirst = (first, second) => first.filter((a) => !second.some((b) => a.userid === b.userid));
  const usersForRoleRemoval = getUniqueInFirst(allUsersHavingGroupIdle, allIdleUsers);
  const usersForRoleAddition = getUniqueInFirst(allIdleUsers, allUsersHavingGroupIdle);

  totalIdleUsers = allIdleUsers.length;
  const totalUserRoleToBeRemoved = usersForRoleRemoval.length;
  const totalUserRoleToBeAdded = usersForRoleAddition.length;

  if (usersForRoleAddition.length) {
    await Promise.all(
      usersForRoleAddition.map(async (user) => {
        try {
          const discordId = user.userid;
          if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
            const alreadyHasRole = await memberRoleModel
              .where("roleid", "==", "1153280659004080148")
              .where("userid", "==", discordId)
              .limit(1)
              .get();
            if (alreadyHasRole.empty) {
              await memberRoleModel.add({
                roleid: "1153280659004080148",
                userid: discordId,
                date: admin.firestore.Timestamp.fromDate(new Date()),
              });
            }
            const response = await addRoleToUser(user.userid, groupIdleRole.role.roleid);
            totalGroupIdleRolesApplied.response.push(response);
            totalGroupIdleRolesApplied.count++;
          }
        } catch (error) {
          totalGroupIdleRolesNotApplied.count++;
          totalGroupIdleRolesNotApplied.errors.push(error.message);
          logger.error(`Error in setting group-idle on user: ${error}`);
        }
      })
    );
  }

  if (usersForRoleRemoval.length) {
    await Promise.all(
      usersForRoleRemoval.map(async (user) => {
        const discordId = user.userid;
        try {
          if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
            const hasRole = await memberRoleModel
              .where("roleid", "==", groupIdleRoleId)
              .where("userid", "==", discordId)
              .limit(1)
              .get();
            if (!hasRole.empty) {
              const oldRole = [];
              hasRole.forEach((role) => oldRole.push({ id: role.id }));
              await memberRoleModel.doc(oldRole[0].id).delete();
            }
            const response = await removeRoleFromUser(groupIdleRole.role.roleid, user.userid);
            totalGroupIdleRolesRemoved.response.push(response);
            totalGroupIdleRolesRemoved.count++;
          }
        } catch (error) {
          totalGroupIdleRolesNotRemoved.count++;
          totalGroupIdleRolesNotRemoved.errors.push(error.message);
          logger.error(`Error in removing group-idle from user: ${error}`);
        }
      })
    );
  }

  return {
    totalIdleUsers,
    totalGroupIdleRolesApplied,
    totalGroupIdleRolesNotApplied,
    totalGroupIdleRolesRemoved,
    totalGroupIdleRolesNotRemoved,
    totalUserRoleToBeRemoved,
    totalUserRoleToBeAdded,
    totalUsersHavingNoDiscordId,
    totalArchivedUsers,
  };
};

const updateUsersNicknameStatus = async (lastNicknameUpdate) => {
  const lastNicknameUpdateTimestamp = Number(lastNicknameUpdate);
  try {
    const usersCurrentStatus = userStatusModel
      .where("currentStatus.updatedAt", ">=", lastNicknameUpdateTimestamp)
      .get();

    const usersFutureStatus = userStatusModel.where("futureStatus.updatedAt", ">=", lastNicknameUpdateTimestamp).get();

    const [usersCurrentStatusSnapshot, usersFutureStatusSnapshots] = await Promise.all([
      usersCurrentStatus,
      usersFutureStatus,
    ]);

    const usersCurrentStatusDocs = usersCurrentStatusSnapshot.docs;
    const futureDocs = usersFutureStatusSnapshots.docs.filter(({ id }) => {
      return !usersCurrentStatusDocs.some((status) => status.id === id);
    });

    const usersStatusDocs = usersCurrentStatusDocs.concat(futureDocs);
    const totalUsersStatus = usersStatusDocs.length;
    const today = Date.now();

    const nicknameUpdateBatches = [];
    for (let start = 0; start < totalUsersStatus; start += SIMULTANEOUS_WORKER_CALLS) {
      const end = Math.min(totalUsersStatus, start + SIMULTANEOUS_WORKER_CALLS);
      nicknameUpdateBatches.push(usersStatusDocs.slice(start, end));
    }

    let successfulUpdates = 0;

    for (const usersStatusDocsBatch of nicknameUpdateBatches) {
      const promises = [];

      for (const document of usersStatusDocsBatch) {
        const doc = document.data();
        const userId = doc.userId;
        const { futureStatus = {}, currentStatus = {} } = doc;

        const { state: futureState } = futureStatus;
        const { state: currentState } = currentStatus;

        if (currentState === userState.OOO && today <= currentStatus.until) {
          promises.push(usersUtils.updateNickname(userId, currentStatus));
        } else if (
          futureState === userState.OOO &&
          today + 3 * ONE_DAY_IN_MS >= futureStatus.from &&
          today <= futureStatus.until
        ) {
          promises.push(usersUtils.updateNickname(userId, futureStatus));
        } else {
          promises.push(usersUtils.updateNickname(userId));
        }
      }

      const settled = await Promise.allSettled(promises);
      for (const result of settled) {
        if (result.status === "fulfilled" && !!result.value) {
          successfulUpdates++;
        } else {
          logger.error(`Error while updating nickname: ${result.reason}`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const res = {
      totalUsersStatus,
      successfulNicknameUpdates: successfulUpdates,
      unsuccessfulNicknameUpdates: totalUsersStatus - successfulUpdates,
    };
    return res;
  } catch (err) {
    logger.error(`Error while retrieving users status documents: ${err}`);
    throw err;
  }
};

const updateIdle7dUsersOnDiscord = async (dev) => {
  let totalIdle7dUsers = 0;
  const totalGroupIdle7dRolesApplied = { count: 0, response: [] };
  const totalGroupIdle7dRolesNotApplied = { count: 0, errors: [] };
  const totalGroupIdle7dRolesRemoved = { count: 0, response: [] };
  const totalGroupIdle7dRolesNotRemoved = { count: 0, errors: [] };
  let totalUsersHavingNoDiscordId = 0;
  let totalArchivedUsers = 0;
  const allIdle7dUsers = [];
  let allUsersHavingGroupIdle7d = [];
  let groupIdle7dRole;
  let groupIdle7dRoleId;

  try {
    groupIdle7dRole = await getGroupRole("group-idle-7d+");
    groupIdle7dRoleId = groupIdle7dRole.role.roleid;
    if (!groupIdle7dRole.roleExists) throw new Error("Idle Role does not exist");

    const { allUserStatus } = await getAllUserStatus({ state: userState.IDLE });
    const discordUsers = await getDiscordMembers();
    const usersHavingIdle7dRole = [];

    discordUsers?.forEach((discordUser) => {
      const isDeveloper = discordUser.roles.includes(discordDeveloperRoleId);
      const haveIdle7dRole = discordUser.roles.includes(groupIdle7dRoleId);
      const isMaven = discordUser.roles.includes(discordMavenRoleId);

      if (dev === "true" && isMaven) {
        allMavens.push(discordUser.user.id);
      }

      if (isDeveloper && haveIdle7dRole) {
        usersHavingIdle7dRole.push({ userid: discordUser.user.id });
      }
    });

    if (allUserStatus) {
      await Promise.all(
        allUserStatus.map(async (userStatus) => {
          const currentDate = new Date();
          const lastDate = new Date(userStatus.currentStatus.from);
          const ONE_DAY = 1000 * 60 * 60 * 24;
          const timeDifference = currentDate.setUTCHours(0, 0, 0, 0) - lastDate.setUTCHours(0, 0, 0, 0);
          const daysDifference = Math.floor(timeDifference / ONE_DAY);
          try {
            if (daysDifference > 7) {
              const userData = await userModel.doc(userStatus.userId).get();
              const isUserArchived = userData.data().roles.archived;
              if (userData.exists) {
                if (isUserArchived) {
                  totalArchivedUsers++;
                } else if (dev === "true" && !allMavens.includes(userData.data().discordId)) {
                  userStatus.userid = userData.data().discordId;
                  allIdle7dUsers.push(userStatus);
                }
              }
            }
          } catch (error) {
            logger.error(`error updating discordId in userStatus ${error.message}`);
            throw new Error("error updating discordId in userStatus");
          }
        })
      );
    }

    allUsersHavingGroupIdle7d = usersHavingIdle7dRole;
  } catch (error) {
    logger.error(`unable to get idle users ${error.message}`);
    throw new Error("unable to get idle users");
  }

  const getUniqueInFirst = (first, second) => first.filter((a) => !second.some((b) => a.userid === b.userid));
  const usersForRoleRemoval = getUniqueInFirst(allUsersHavingGroupIdle7d, allIdle7dUsers);
  const usersForRoleAddition = getUniqueInFirst(allIdle7dUsers, allUsersHavingGroupIdle7d);

  totalIdle7dUsers = allIdle7dUsers.length;
  const totalUserRoleToBeRemoved = usersForRoleRemoval.length;
  const totalUserRoleToBeAdded = usersForRoleAddition.length;

  if (usersForRoleAddition.length) {
    await Promise.all(
      usersForRoleAddition.map(async (user) => {
        try {
          const discordId = user.userid;
          if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
            const alreadyHasRole = await memberRoleModel
              .where("roleid", "==", groupIdle7dRoleId)
              .where("userid", "==", discordId)
              .limit(1)
              .get();
            if (alreadyHasRole.empty) {
              await memberRoleModel.add({
                roleid: groupIdle7dRoleId,
                userid: discordId,
                date: admin.firestore.Timestamp.fromDate(new Date()),
              });
            }
            const response = await addRoleToUser(user.userid, groupIdle7dRole.role.roleid);
            totalGroupIdle7dRolesApplied.response.push(response);
            totalGroupIdle7dRolesApplied.count++;
          }
        } catch (error) {
          totalGroupIdle7dRolesNotApplied.count++;
          totalGroupIdle7dRolesNotApplied.errors.push(error.message);
          logger.error(`Error in setting group-idle on user: ${error}`);
        }
      })
    );
  }

  if (usersForRoleRemoval.length) {
    await Promise.all(
      usersForRoleRemoval.map(async (user) => {
        const discordId = user.userid;
        try {
          if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
            const hasRole = await memberRoleModel
              .where("roleid", "==", groupIdle7dRoleId)
              .where("userid", "==", discordId)
              .limit(1)
              .get();
            if (!hasRole.empty) {
              const oldRole = [];
              hasRole.forEach((role) => oldRole.push({ id: role.id }));
              await memberRoleModel.doc(oldRole[0].id).delete();
            }
            const response = await removeRoleFromUser(groupIdle7dRole.role.roleid, user.userid);
            totalGroupIdle7dRolesRemoved.response.push(response);
            totalGroupIdle7dRolesRemoved.count++;
          }
        } catch (error) {
          totalGroupIdle7dRolesNotRemoved.count++;
          totalGroupIdle7dRolesNotRemoved.errors.push(error.message);
          logger.error(`Error in removing group-idle from user: ${error}`);
        }
      })
    );
  }

  return {
    totalIdle7dUsers,
    totalGroupIdle7dRolesApplied,
    totalGroupIdle7dRolesNotApplied,
    totalGroupIdle7dRolesRemoved,
    totalGroupIdle7dRolesNotRemoved,
    totalUserRoleToBeRemoved,
    totalUserRoleToBeAdded,
    totalUsersHavingNoDiscordId,
    totalArchivedUsers,
  };
};

/**
 * Filters out onboarding users who have an approved onboarding extension request that is still valid.
 *
 * This function iterates through the given list of onboarding users and checks if each user has a valid
 * approved onboarding extension request. If a valid extension request exists with a `newEndsOn`
 * date greater than the current date, the user is skipped. Otherwise, the user is added to the
 * returned list.
 *
 * @async
 * @function skipOnboardingUsersHavingApprovedExtensionRequest
 * @param {Array<Object>} [users=[]] - An array of user objects to be filtered. Each user object
 *                                     must have an `id` property.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of users who do not have
 *                                   a valid approved onboarding extension request.
 */
const skipOnboardingUsersHavingApprovedExtensionRequest = async (users = []) => {
  const currentTime = Date.now();

  const results = await Promise.all(
    users.map(async (user) => {
      try {
        const latestApprovedExtension = await getRequestByKeyValues({
          type: REQUEST_TYPE.ONBOARDING,
          state: REQUEST_STATE.APPROVED,
          userId: user.id,
        });

        if (latestApprovedExtension && latestApprovedExtension.newEndsOn > currentTime) {
          return null;
        }

        return user;
      } catch (error) {
        logger.error(`Error while fetching latest approved extension for user ${user.id}:`, error);
        return null;
      }
    })
  );

  return results.filter(Boolean);
};

const updateUsersWith31DaysPlusOnboarding = async () => {
  try {
    let allOnboardingUsers31DaysCompleted = await getUsersBasedOnFilter({
      state: userState.ONBOARDING,
      time: "31d",
    });

    allOnboardingUsers31DaysCompleted = await skipOnboardingUsersHavingApprovedExtensionRequest(
      allOnboardingUsers31DaysCompleted
    );

    const discordMembers = await getDiscordMembers();
    const groupOnboardingRole = await getGroupRole("group-onboarding-31d+");
    const groupOnboardingRoleId = groupOnboardingRole.role.roleid;
    if (!groupOnboardingRole.roleExists) throw new Error("Role does not exist");

    const allOnboardingDevs31DaysCompleted = allOnboardingUsers31DaysCompleted.filter((user) => {
      const discordMember = discordMembers.find((discordUser) => discordUser.user.id === user.discordId);
      const isDeveloper = discordMember && discordMember.roles.includes(discordDeveloperRoleId);
      const isNotMaven = discordMember && !discordMember.roles.includes(discordMavenRoleId);
      return isDeveloper && isNotMaven;
    });

    const usersAlreadyHavingOnboaring31DaysRole = [];

    discordMembers?.forEach((discordUser) => {
      const isDeveloper = discordUser.roles.includes(discordDeveloperRoleId);
      const haveOnboarding31DaysRole = discordUser.roles.includes(groupOnboardingRoleId);
      if (isDeveloper && haveOnboarding31DaysRole) {
        usersAlreadyHavingOnboaring31DaysRole.push({ discordId: discordUser.user.id });
      }
    });

    const usersForRoleAddition = allOnboardingDevs31DaysCompleted.filter(
      (user1) => !usersAlreadyHavingOnboaring31DaysRole.some((user2) => user1.discordId === user2.discordId)
    );

    const errorInFetchingUserDetailsForRoleRemoval = { count: 0, errors: [] };
    const usersForRoleRemoval = await Promise.all(
      usersAlreadyHavingOnboaring31DaysRole.map(async (user) => {
        try {
          const userDetails = await fetchUser({ discordId: user.discordId });
          const userStatus = await getUserStatus(userDetails.user.id);
          if (userStatus.data.currentStatus.state !== userState.ONBOARDING) {
            return userDetails.user;
          }
        } catch (error) {
          errorInFetchingUserDetailsForRoleRemoval.count++;
          errorInFetchingUserDetailsForRoleRemoval.errors.push({
            error: "Error in getting users to remove role",
            discordId: user.discordId,
          });
          logger.error(`Error in getting users to remove role: ${error}`);
        }
        return null;
      })
    );
    const filteredUsersForRoleRemoval = usersForRoleRemoval.filter((user) => user !== null);

    let totalUsersHavingNoDiscordId = 0;
    let totalArchivedUsers = 0;
    const totalOnboarding31dPlusRoleApplied = { count: 0, response: [] };
    const totalOnboarding31dPlusRoleNoteApplied = { count: 0, errors: [] };
    const totalOnboarding31dPlusRoleRemoved = { count: 0, response: [] };
    const totalOnboarding31dPlusRoleNotRemoved = { count: 0, errors: [] };

    if (usersForRoleAddition.length) {
      await Promise.all(
        usersForRoleAddition.map(async (user) => {
          const userDiscordId = user.discordId;
          try {
            const result = await dataAccess.retrieveUsers({ id: userDiscordId });
            if (result.user?.roles?.archived) {
              totalArchivedUsers++;
            } else if (!userDiscordId) {
              totalUsersHavingNoDiscordId++;
            } else {
              const alreadyHasRole = await memberRoleModel
                .where("roleid", "==", groupOnboardingRoleId)
                .where("userid", "==", userDiscordId)
                .limit(1)
                .get();
              if (alreadyHasRole.empty) {
                await memberRoleModel.add({
                  roleid: groupOnboardingRoleId,
                  userid: userDiscordId,
                  date: admin.firestore.Timestamp.fromDate(new Date()),
                });
              }
              const response = await addRoleToUser(userDiscordId, groupOnboardingRoleId);
              totalOnboarding31dPlusRoleApplied.response.push({ message: response.message, discordId: userDiscordId });
              totalOnboarding31dPlusRoleApplied.count++;
            }
          } catch (error) {
            totalOnboarding31dPlusRoleNoteApplied.count++;
            totalOnboarding31dPlusRoleNoteApplied.errors.push({ error: error.message, discordId: userDiscordId });
            logger.error(`Error in setting group-onboarding-31+ role on user: ${error}`);
          }
        })
      );
    }

    if (filteredUsersForRoleRemoval.length) {
      await Promise.all(
        filteredUsersForRoleRemoval.map(async (user) => {
          const userDiscordId = user.discordId;
          try {
            if (!user.discordId) {
              totalUsersHavingNoDiscordId++;
            } else {
              const hasRole = await memberRoleModel
                .where("roleid", "==", groupOnboardingRoleId)
                .where("userid", "==", userDiscordId)
                .limit(1)
                .get();
              if (!hasRole.empty) {
                const oldRole = [];
                hasRole.forEach((role) => oldRole.push({ id: role.id }));
                await memberRoleModel.doc(oldRole[0].id).delete();
              }
              const response = await removeRoleFromUser(groupOnboardingRoleId, userDiscordId);
              totalOnboarding31dPlusRoleRemoved.response.push({ message: response.message, discordId: userDiscordId });
              totalOnboarding31dPlusRoleRemoved.count++;
            }
          } catch (error) {
            totalOnboarding31dPlusRoleNotRemoved.count++;
            totalOnboarding31dPlusRoleNotRemoved.errors.push({ error: error.message, discordId: userDiscordId });
            logger.error(`Error in removing group-onboarding-31d+ role from user: ${error}`);
          }
        })
      );
    }

    const totalOnboardingUsers31DaysCompleted = allOnboardingDevs31DaysCompleted.map(({ id, discordId, username }) => ({
      userId: id,
      discordId,
      username,
    }));

    return {
      totalOnboardingUsers31DaysCompleted: {
        users: totalOnboardingUsers31DaysCompleted,
        count: totalOnboardingUsers31DaysCompleted.length,
      },
      totalUsersHavingNoDiscordId,
      totalArchivedUsers,
      usersAlreadyHavingOnboaring31DaysRole: {
        users: usersAlreadyHavingOnboaring31DaysRole,
        count: usersAlreadyHavingOnboaring31DaysRole.length,
      },
      totalOnboarding31dPlusRoleApplied,
      totalOnboarding31dPlusRoleNoteApplied,
      totalOnboarding31dPlusRoleRemoved,
      totalOnboarding31dPlusRoleNotRemoved,
      errorInFetchingUserDetailsForRoleRemoval,
    };
  } catch (error) {
    logger.error(`Error while fetching onboarding users who have completed 31 days ${error.message}`);
    throw new Error("Error while fetching onboarding users who have completed 31 days");
  }
};

const getMissedProgressUpdatesUsers = async (options = {}) => {
  const { cursor, size = 500, excludedDates = [], excludedDays = [0], dateGap = 3 } = options;
  const stats = {
    tasks: 0,
    missedUpdatesTasks: 0,
    filteredByOoo: 0,
  };
  try {
    const discordUsersPromise = discordService.getDiscordMembers();
    const missedUpdatesRoleId = discordMissedUpdatesRoleId;

    const normalizedExcludedWeekdays = new Set(
      excludedDays.map((day) => Number(day)).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    );

    if (normalizedExcludedWeekdays.size === 7) {
      return { usersToAddRole: [], ...stats };
    }

    const normalizedExcludedDates = excludedDates.reduce((set, timestamp) => {
      const normalizedTimestamp = convertTimestampToUTCStartOrEndOfDay(Number(timestamp));
      if (normalizedTimestamp !== null) {
        set.add(normalizedTimestamp);
      }
      return set;
    }, new Set());

    const currentTimestamp = Date.now();
    const gapWindowEnd = convertTimestampToUTCStartOrEndOfDay(currentTimestamp, true);
    let gapWindowStart = convertTimestampToUTCStartOrEndOfDay(currentTimestamp, false);
    let remainingWorkingDays = Number.isInteger(dateGap) && dateGap > 0 ? dateGap : 0;

    while (remainingWorkingDays > 0 && gapWindowStart !== null) {
      const dayOfWeek = new Date(gapWindowStart).getUTCDay();
      const isExcludedDay = normalizedExcludedWeekdays.has(dayOfWeek);
      const isExcludedDate = normalizedExcludedDates.has(gapWindowStart);

      if (!isExcludedDay && !isExcludedDate) {
        remainingWorkingDays--;
      }

      const previousDayTimestamp = gapWindowStart - convertDaysToMilliseconds(1);
      const previousDayStart = convertTimestampToUTCStartOrEndOfDay(previousDayTimestamp, false);

      if (remainingWorkingDays === 0) {
        gapWindowStart = previousDayStart ?? gapWindowStart;
        break;
      }

      if (previousDayStart === null) {
        gapWindowStart = null;
        break;
      }

      gapWindowStart = previousDayStart;
    }

    if (gapWindowStart === null || remainingWorkingDays > 0) {
      return { usersToAddRole: [], ...stats };
    }

    while (gapWindowStart !== null) {
      const dayOfWeek = new Date(gapWindowStart).getUTCDay();
      const isExcludedDay = normalizedExcludedWeekdays.has(dayOfWeek);
      const isExcludedDate = normalizedExcludedDates.has(gapWindowStart);

      if (!isExcludedDay && !isExcludedDate) {
        break;
      }

      const previousDayTimestamp = gapWindowStart - convertDaysToMilliseconds(1);
      gapWindowStart = convertTimestampToUTCStartOrEndOfDay(previousDayTimestamp, false);
    }

    if (gapWindowStart === null) {
      return { usersToAddRole: [], ...stats };
    }

    let taskQuery = buildTasksQueryForMissedUpdates(size);

    if (cursor) {
      const data = await tasksModel.doc(cursor).get();
      if (!data.data()) {
        return {
          error: "Bad Request",
          message: `Invalid cursor: ${cursor}`,
        };
      }
      taskQuery = taskQuery.startAfter(data);
    }

    const usersMap = new Map();
    const progressCountPromise = [];
    const tasksQuerySnapshot = await taskQuery.get();

    stats.tasks = tasksQuerySnapshot.size;
    tasksQuerySnapshot.forEach((doc) => {
      const { assignee: taskAssignee, startedOn: taskStartedOn } = doc.data();
      if (!taskAssignee || taskStartedOn >= convertMillisToSeconds(gapWindowStart)) return;

      const taskId = doc.id;

      if (usersMap.has(taskAssignee)) {
        const userData = usersMap.get(taskAssignee);
        userData.tasksCount++;
      } else {
        usersMap.set(taskAssignee, {
          tasksCount: 1,
          latestProgressCount: dateGap + 1,
          isOOO: false,
        });
      }
      const updateTasksIdMap = async () => {
        const progressQuery = buildProgressQueryForMissedUpdates(taskId, gapWindowStart, gapWindowEnd);
        const progressSnapshot = await progressQuery.get();
        const userData = usersMap.get(taskAssignee);
        userData.latestProgressCount = Math.min(progressSnapshot.data().count, userData.latestProgressCount);

        if (userData.latestProgressCount === 0) {
          stats.missedUpdatesTasks++;
        }
      };
      progressCountPromise.push(updateTasksIdMap());
    });

    const userIdChunks = chunks(Array.from(usersMap.keys()), FIRESTORE_IN_CLAUSE_SIZE);
    const userStatusSnapshotPromise = userIdChunks.map(
      async (userIdList) => await userStatusModel.where("userId", "in", userIdList).get()
    );
    const userDetailsPromise = userIdChunks.map(
      async (userIdList) =>
        await userModel
          .where("roles.archived", "==", false)
          .where(admin.firestore.FieldPath.documentId(), "in", userIdList)
          .get()
    );

    const userStatusChunks = await Promise.all(userStatusSnapshotPromise);

    userStatusChunks.forEach((userStatusList) =>
      userStatusList.forEach((doc) => {
        const userStatusData = doc.data();
        const mappedUser = usersMap.get(userStatusData.userId);
        if (!mappedUser) {
          return;
        }
        mappedUser.isOOO = userStatusData.currentStatus?.state === userState.OOO;
        mappedUser.lastOooUntil = userStatusData.lastOooUntil ?? null;
      })
    );

    const userDetailsListChunks = await Promise.all(userDetailsPromise);
    userDetailsListChunks.forEach((userList) => {
      userList.forEach((doc) => {
        const userData = usersMap.get(doc.id);
        userData.discordId = doc.data().discordId;
      });
    });

    const discordUserList = await discordUsersPromise;
    const discordUserMap = new Map();
    discordUserList.forEach((discordUser) => {
      const discordUserData = { isBot: !!discordUser.user.bot };
      discordUser.roles.forEach((roleId) => {
        switch (roleId) {
          case discordDeveloperRoleId: {
            discordUserData.isDeveloper = true;
            break;
          }
          case discordMavenRoleId: {
            discordUserData.isMaven = true;
            break;
          }
          case missedUpdatesRoleId: {
            discordUserData.hasMissedUpdatesRole = true;
            break;
          }
        }
      });
      discordUserMap.set(discordUser.user.id, discordUserData);
    });

    await Promise.all(progressCountPromise);

    const gracePeriodCutoff = Date.now() - convertDaysToMilliseconds(POST_OOO_GRACE_PERIOD_IN_DAYS);
    for (const [userId, userData] of usersMap.entries()) {
      const discordUserData = discordUserMap.get(userData.discordId);
      const isDiscordMember = !!discordUserData;
      const normalizedLastOooUntil = normalizeTimestamp(userData.lastOooUntil);
      const isWithinGracePeriod = normalizedLastOooUntil !== null && normalizedLastOooUntil >= gracePeriodCutoff;

      if (userData.latestProgressCount === 0 && (userData.isOOO || isWithinGracePeriod)) {
        stats.filteredByOoo++;
        usersMap.delete(userId);
        continue;
      }
      const shouldAddRole =
        userData.latestProgressCount === 0 &&
        !userData.isOOO &&
        isDiscordMember &&
        discordUserData.isDeveloper &&
        !discordUserData.isMaven &&
        !discordUserData.isBot &&
        !discordUserData.hasMissedUpdatesRole;

      if (!shouldAddRole) {
        usersMap.delete(userId);
      }
    }

    const usersToAddRole = [];
    for (const userData of usersMap.values()) {
      usersToAddRole.push(userData.discordId);
    }
    const resultDataLength = tasksQuerySnapshot.docs.length;
    const isLast = size && resultDataLength === size;
    const lastVisible = isLast && tasksQuerySnapshot.docs[resultDataLength - 1];

    if (lastVisible) {
      stats.cursor = lastVisible.id;
    }

    return { usersToAddRole, ...stats };
  } catch (err) {
    logger.error("Error while running the add missed roles script", err);
    throw err;
  }
};

const addInviteToInviteModel = async (inviteObject) => {
  try {
    const invite = await discordInvitesModel.add(inviteObject);
    return invite.id;
  } catch (err) {
    logger.error("Error in adding invite", err);
    throw err;
  }
};

const getUserDiscordInvite = async (userId) => {
  try {
    const invite = await discordInvitesModel.where("userId", "==", userId).get();
    const [inviteDoc] = invite.docs;
    if (inviteDoc) {
      return { id: inviteDoc.id, ...inviteDoc.data(), notFound: false };
    } else {
      return { notFound: true };
    }
  } catch (err) {
    logger.log("error in getting user invite", err);
    throw err;
  }
};
const groupUpdateLastJoinDate = async ({ id }) => {
  await discordRoleModel.doc(id).set({ lastUsedOn: admin.firestore.Timestamp.fromDate(new Date()) }, { merge: true });
  return { updated: true };
};

module.exports = {
  createNewRole,
  removeMemberGroup,
  getGroupRolesForUser,
  getPaginatedGroupRolesByPage,
  getAllGroupRoles,
  getGroupRoleByName,
  updateGroupRole,
  addGroupRoleToMember,
  isGroupRoleExists,
  deleteRoleFromDatabase,
  updateDiscordImageForVerification,
  enrichGroupDataWithMembershipInfo,
  fetchGroupToUserMapping,
  updateIdleUsersOnDiscord,
  updateUsersNicknameStatus,
  updateIdle7dUsersOnDiscord,
  updateUsersWith31DaysPlusOnboarding,
  getMissedProgressUpdatesUsers,
  getUserDiscordInvite,
  addInviteToInviteModel,
  groupUpdateLastJoinDate,
  deleteGroupRole,
  skipOnboardingUsersHavingApprovedExtensionRequest,
};
