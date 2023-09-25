const { generateDiscordProfileImageUrl } = require("../utils/discord-actions");
const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const admin = require("firebase-admin");
const { findSubscribedGroupIds } = require("../utils/helper");
const { retrieveUsers } = require("../services/dataAccessLayer");
const { BATCH_SIZE_IN_CLAUSE } = require("../constants/firebase");
const { getAllUserStatus, getGroupRole, getUserStatus } = require("./userStatus");
const { userState } = require("../constants/userStatus");
const userModel = firestore.collection("users");
const photoVerificationModel = firestore.collection("photo-verification");
const dataAccess = require("../services/dataAccessLayer");
const { getDiscordMembers, addRoleToUser, removeRoleFromUser } = require("../services/discordService");
const discordDeveloperRoleId = config.get("discordDeveloperRoleId");
const { getUsersBasedOnFilter, fetchUser } = require("./users");

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

  try {
    groupIdleRole = await getGroupRole("group-idle");
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
          if (result.user?.roles?.archived) {
            totalArchivedUsers++;
          } else if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
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
        try {
          if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
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

const updateUsersWith31DaysPlusOnboarding = async () => {
  try {
    const allOnboardingUsers31DaysCompleted = await getUsersBasedOnFilter({
      state: userState.ONBOARDING,
      time: "31d",
    });
    const discordMembers = await getDiscordMembers();
    const groupOnboardingRole = await getGroupRole("group-onboarding-31d+");
    if (!groupOnboardingRole.roleExists) throw new Error("Role does not exist");

    const usersAlreadyHavingOnboaring31DaysRole = [];

    discordMembers?.forEach((discordUser) => {
      const isDeveloper = discordUser.roles.includes(discordDeveloperRoleId);
      const haveOnboarding31DaysRole = discordUser.roles.includes(groupOnboardingRole.role.roleid);
      if (isDeveloper && haveOnboarding31DaysRole) {
        usersAlreadyHavingOnboaring31DaysRole.push({ discordId: discordUser.user.id });
      }
    });

    const usersForRoleAddition = allOnboardingUsers31DaysCompleted.filter(
      (user1) => !usersAlreadyHavingOnboaring31DaysRole.some((user2) => user1.discordId === user2.discordId)
    );

    const usersForRoleRemoval = await Promise.all(
      usersAlreadyHavingOnboaring31DaysRole.map(async (user) => {
        try {
          const userDetails = await fetchUser({ discordId: user.discordId });
          const userStatus = await getUserStatus(userDetails.user.id);
          if (userStatus.data.currentStatus.state !== userState.ONBOARDING) {
            return userDetails.user;
          }
        } catch (error) {
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
          try {
            const result = await dataAccess.retrieveUsers({ id: user.discordId });
            if (result.user?.roles?.archived) {
              totalArchivedUsers++;
            } else if (!user.discordId) {
              totalUsersHavingNoDiscordId++;
            } else {
              const response = await addRoleToUser(user.discordId, groupOnboardingRole.role.roleid);
              totalOnboarding31dPlusRoleApplied.response.push({ message: response.message, discordId: user.discordId });
              totalOnboarding31dPlusRoleApplied.count++;
            }
          } catch (error) {
            totalOnboarding31dPlusRoleNoteApplied.count++;
            totalOnboarding31dPlusRoleNoteApplied.errors.push({ error: error.message, discordId: user.discordId });
            logger.error(`Error in setting group-onboarding-31+ role on user: ${error}`);
          }
        })
      );
    }

    if (filteredUsersForRoleRemoval.length) {
      await Promise.all(
        filteredUsersForRoleRemoval.map(async (user) => {
          try {
            if (!user.discordId) {
              totalUsersHavingNoDiscordId++;
            } else {
              const response = await removeRoleFromUser(groupOnboardingRole.role.roleid, user.discordId);
              totalOnboarding31dPlusRoleRemoved.response.push({ message: response.message, discordId: user.discordId });
              totalOnboarding31dPlusRoleRemoved.count++;
            }
          } catch (error) {
            totalOnboarding31dPlusRoleNotRemoved.count++;
            totalOnboarding31dPlusRoleNotRemoved.errors.push({ error: error.message, discordId: user.discordId });
            logger.error(`Error in removing group-onboarding-31d+ role from user: ${error}`);
          }
        })
      );
    }

    const totalOnboardingUsers31DaysCompleted = allOnboardingUsers31DaysCompleted.map(
      ({ id, discordId, username }) => ({ userId: id, discordId, username })
    );
    return {
      totalOnboardingUsers31DaysCompleted: {
        users: totalOnboardingUsers31DaysCompleted,
        count: totalOnboardingUsers31DaysCompleted.length,
      },
      totalUsersHavingNoDiscordId,
      totalArchivedUsers,
      usersAlreadyHavingOnboaring31DaysRole,
      totalOnboarding31dPlusRoleApplied,
      totalOnboarding31dPlusRoleNoteApplied,
      totalOnboarding31dPlusRoleRemoved,
      totalOnboarding31dPlusRoleNotRemoved,
    };
  } catch (error) {
    logger.error(`Error while fetching onboarding users ${error.message}`);
    throw new Error("Error while fetching onboarding users");
  }
};

module.exports = {
  createNewRole,
  getGroupRolesForUser,
  getAllGroupRoles,
  addGroupRoleToMember,
  isGroupRoleExists,
  updateDiscordImageForVerification,
  enrichGroupDataWithMembershipInfo,
  fetchGroupToUserMapping,
  updateIdleUsersOnDiscord,
  updateUsersWith31DaysPlusOnboarding,
};
