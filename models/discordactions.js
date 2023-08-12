const { generateDiscordProfileImageUrl } = require("../utils/discord-actions");
const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const admin = require("firebase-admin");
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

const getNumberOfMemberForGroups = async (groups = []) => {
  try {
    if (!groups.length) {
      return [];
    }
    const roleIds = groups.map((group) => group.roleid);

    const snapshots = await memberRoleModel.where("roleid", "in", roleIds).get();
    const roleCount = {};

    snapshots.forEach((doc) => {
      const roleToMemberMapping = doc.data();

      if (roleCount[roleToMemberMapping.roleid]) {
        roleCount[roleToMemberMapping.roleid] += 1;
      } else {
        roleCount[roleToMemberMapping.roleid] = 1;
      }
    });

    return groups.map((group) => ({
      ...group,
      memberCount: roleCount[group.roleid] || 0,
    }));
  } catch (err) {
    logger.error("Error while counting members for each group", err);
    throw err;
  }
};

module.exports = {
  createNewRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  isGroupRoleExists,
  updateDiscordImageForVerification,
  getNumberOfMemberForGroups,
};
