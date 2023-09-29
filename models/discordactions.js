const { generateDiscordProfileImageUrl } = require("../utils/discord-actions");
const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const admin = require("firebase-admin");
const { findSubscribedGroupIds } = require("../utils/helper");
const { retrieveUsers } = require("../services/dataAccessLayer");
const { BATCH_SIZE_IN_CLAUSE } = require("../constants/firebase");
const { getAllUserStatus, getGroupRole } = require("./userStatus");
const { userState } = require("../constants/userStatus");
const userModel = firestore.collection("users");
const photoVerificationModel = firestore.collection("photo-verification");
const dataAccess = require("../services/dataAccessLayer");
const { getDiscordMembers, addRoleToUser, removeRoleFromUser } = require("../services/discordService");
const discordDeveloperRoleId = config.get("discordDeveloperRoleId");

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

const removeMemberGroup = async (roleId, discordId) => {
  try {
    const discordResponse = await removeRoleFromUser(roleId, discordId);
    if (discordResponse) {
      const backendResponse = await deleteRoleFromDatabase(roleId, discordId);
      return backendResponse;
    }
  } catch (error) {
    logger.error(`Error while removing role: ${error}`);
    throw new Error(error);
  }
  return false;
};

const deleteRoleFromDatabase = async (roleId, discordId) => {
  try {
    const rolesToDeleteSnapshot = await memberRoleModel
      .where("userid", "==", discordId)
      .where("roleid", "==", roleId)
      .limit(1)
      .get();

    if (rolesToDeleteSnapshot.docs.length > 0) {
      const doc = rolesToDeleteSnapshot.docs[0];
      const roleRef = memberRoleModel.doc(doc.id);
      await roleRef.delete();
      return { roleId: roleId, wasSuccess: true };
    }
    return { roleId: roleId, wasSuccess: false };
  } catch (error) {
    const errorMessage = `Error while deleting role from backend: ${error}`;
    logger.error(errorMessage);
  }
  return false;
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
 * @param roleData { Object }: Data of the new role
 * @returns {Promise<discordRoleModel|Object>}
 */

const isGroupRoleExists = async (rolename) => {
  try {
    const alreadyIsRole = await discordRoleModel.where("rolename", "==", rolename).limit(1).get();
    if (!alreadyIsRole.empty) {
      const oldRole = [];
      alreadyIsRole.forEach((role) => oldRole.push(role.data()));
      return { wasSuccess: false };
    }
    return { wasSuccess: true };
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
      const groupCreator = groupCreatorsDetails[group.createdBy];
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

const updateIdleUsersOnDiscord = async () => {
  let totalIdleUsers = 0;
  const totalGroupIdleRolesApplied = { count: 0, response: [] };
  const totalGroupIdleRolesNotApplied = { count: 0, errors: [] };
  const totalGroupIdleRolesRemoved = { count: 0, response: [] };
  const totalGroupIdleRolesNotRemoved = { count: 0, errors: [] };
  let totalUsersHavingNoDiscordId = 0;
  let totalArchivedUsers = 0;
  let allIdleUsers = [];
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

      if (isDeveloper && haveIdleRole) {
        usersHavingIdleRole.push({ userid: discordUser.user.id });
      }
    });
    if (allUserStatus) {
      await Promise.all(
        allUserStatus.map(async (userStatus) => {
          try {
            const userData = await userModel.doc(userStatus.userId).get();
            if (userData.exists) {
              userStatus.userid = userData.data().discordId;
            }
          } catch (error) {
            logger.error(`error updating discordId in userStatus ${error.message}`);
            throw new Error("error updating discordId in userStatus");
          }
        })
      );
    }
    allIdleUsers = allUserStatus;
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
          const result = await dataAccess.retrieveUsers({ id: user.userId });
          const discordId = user.userid;
          if (result.user?.roles?.archived) {
            totalArchivedUsers++;
          } else if (!user.userid) {
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

const updateIdle7dUsersOnDiscord = async () => {
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
              if (userData.exists) {
                userStatus.userid = userData.data().discordId;
                allIdle7dUsers.push(userStatus);
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
          const result = await dataAccess.retrieveUsers({ id: user.userId });
          const discordId = user.userid;
          if (result.user?.roles?.archived) {
            totalArchivedUsers++;
          } else if (!user.userid) {
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
        const discordId = user.roleid;
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

module.exports = {
  createNewRole,
  removeMemberGroup,
  getGroupRolesForUser,
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
  updateIdle7dUsersOnDiscord,
};
