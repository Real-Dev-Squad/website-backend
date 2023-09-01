const { generateDiscordProfileImageUrl } = require("../utils/discord-actions");
const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const admin = require("firebase-admin");
const { findSubscribedGroupIds } = require("../utils/helper");
const { retrieveUsers } = require("../services/dataAccessLayer");
const { BATCH_SIZE_IN_CLAUSE } = require("../constants/firebase");
const photoVerificationModel = firestore.collection("photo-verification");

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
const getGroupRole = async (rolename) => {
  try {
    if (!rolename) return { roleExists: false };
    const data = await discordRoleModel.where("rolename", "==", rolename).limit(1).get();
    if (data.empty) {
      return {
        roleExists: false,
      };
    }
    return {
      roleExists: true,
      role: {
        id: data.docs[0].id,
        ...data.docs[0].data(),
      },
    };
  } catch (err) {
    logger.error("Error in getting role", err);
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
 * @param roleData { Object }: Data of the new role
 * @returns {Promise<discordRoleModel|Object>}
 */
const removeGroupRoleFromMember = async (roleData) => {
  try {
    const hasRole = await memberRoleModel
      .where("roleid", "==", roleData.roleid)
      .where("userid", "==", roleData.userid)
      .limit(1)
      .get();
    if (hasRole.empty) {
      return { wasSuccess: false };
    }
    const oldRole = [];
    hasRole.forEach((role) => oldRole.push({ id: role.id }));
    await memberRoleModel.doc(oldRole[0].id).delete();
    return { wasSuccess: true };
  } catch (err) {
    logger.error("Error in deleting role", err);
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

module.exports = {
  createNewRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  removeGroupRoleFromMember,
  isGroupRoleExists,
  updateDiscordImageForVerification,
  enrichGroupDataWithMembershipInfo,
  fetchGroupToUserMapping,
  getGroupRole,
};
