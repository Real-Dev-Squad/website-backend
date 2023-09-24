const { generateDiscordProfileImageUrl } = require("../utils/discord-actions");
const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const discordInvitesModel = firestore.collection("discord-invites");
const admin = require("firebase-admin");
const { findSubscribedGroupIds } = require("../utils/helper");
const { retrieveUsers } = require("../services/dataAccessLayer");
const { BATCH_SIZE_IN_CLAUSE } = require("../constants/firebase");
const {
  getAllUserStatus,
  addGroupRoleToDiscordUser,
  getGroupRole,
  removeGroupRoleFromDiscordUser,
} = require("./userStatus");
const { userState } = require("../constants/userStatus");
const userModel = firestore.collection("users");
const photoVerificationModel = firestore.collection("photo-verification");
const dataAccess = require("../services/dataAccessLayer");

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

const getAllUsersHavingRole = async (rolename) => {
  try {
    if (!rolename) return { roleExists: false };
    const data = await discordRoleModel.where("rolename", "==", rolename).limit(1).get();
    if (data.empty) {
      return {
        roleExists: false,
      };
    }

    const roleId = data.docs[0].data().roleid;
    const usersHavingRole = [];
    const snapshot = await memberRoleModel.where("roleid", "==", roleId).get();
    snapshot.forEach((doc) => {
      const role = {
        id: doc.id,
        ...doc.data(),
      };
      usersHavingRole.push(role);
    });
    return { usersHavingRole };
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
  let totalGroupIdleRolesApplied = 0;
  const totalGroupIdleRolesNotApplied = { count: 0, errors: [] };
  let totalGroupIdleRolesRemoved = 0;
  const totalGroupIdleRolesNotRemoved = { count: 0, errors: [] };
  let totalUsersHavingNoDiscordId = 0;
  let totalArchivedUsers = 0;
  let allIdleUsers = [];
  let allUsersHavingGroupIdle = [];

  try {
    const { allUserStatus } = await getAllUserStatus({ state: userState.IDLE });
    const { usersHavingRole } = await getAllUsersHavingRole("group-idle");
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
    allUsersHavingGroupIdle = usersHavingRole;
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
          const groupIdleRole = await getGroupRole("group-idle");
          if (!groupIdleRole.roleExists) throw new Error("Role does not exist");
          const result = await dataAccess.retrieveUsers({ id: user.userId });
          if (result.user?.roles?.archived) {
            totalArchivedUsers++;
          } else if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
            await addGroupRoleToDiscordUser({ discordId: user.userid, roleId: groupIdleRole.role.roleid });
            totalGroupIdleRolesApplied++;
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
          const groupIdleRole = await getGroupRole("group-idle");
          if (!groupIdleRole.roleExists) throw new Error("Role does not exist");
          if (!user.userid) {
            totalUsersHavingNoDiscordId++;
          } else {
            await removeGroupRoleFromDiscordUser({ discordId: user.userid, roleId: groupIdleRole.role.roleid });
            totalGroupIdleRolesRemoved++;
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
      return { id: inviteDoc.id, ...inviteDoc.data() };
    } else {
      return { notFound: true };
    }
  } catch (err) {
    logger.log("error in getting user invite", err);
    throw err;
  }
};

module.exports = {
  createNewRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  isGroupRoleExists,
  updateDiscordImageForVerification,
  enrichGroupDataWithMembershipInfo,
  fetchGroupToUserMapping,
  updateIdleUsersOnDiscord,
  getUserDiscordInvite,
  addInviteToInviteModel,
};
