const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");

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

const isGroupRoleExists = async (roleName) => {
  try {
    const alreadyIsRole = await discordRoleModel.where("roleName", "==", roleName).limit(1).get();
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
      .where("roleId", "==", roleData.roleId)
      .where("userId", "==", roleData.userId)
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
 * @returns {Promise<Object>}
 */
const migrateGroupRoleToMember = async () => {
  try {
    const batch = firestore.batch();
    const documentList = await memberRoleModel.get();
    documentList.forEach((doc) => {
      const data = doc.data();

      if (data.roleid !== undefined && data.userid !== undefined) {
        const updatedData = {
          date: data.date,
          roleId: data.roleid,
          userId: data.userid,
        };
        batch.set(doc.ref, updatedData);
      }
    });
    await batch.commit();

    if (batch._ops.length === 0) {
      return { status: 204, message: "No documents were updated." };
    } else if (batch._ops.length > 100) {
      logger.info(
        `Warning: More than 100 Member group roles documents to update. The max limit permissible is 500. Refer https://github.com/Real-Dev-Squad/website-backend/issues/890 for more details.`
      );
    }
    return { status: 200, message: "Member group roles updated Successfully." };
  } catch (err) {
    logger.error("Error in updating Member group roles", err);
    return { status: 500, message: "Member group roles couldn't be updated Successfully." };
  }
};

/**
 *
 * @returns {Promise<Object>}
 */
const migrateDiscordRole = async () => {
  try {
    const batch = firestore.batch();
    const documentList = await discordRoleModel.get();
    documentList.forEach((doc) => {
      const data = doc.data();

      if (data.roleid !== undefined && data.rolename !== undefined) {
        const updatedData = {
          createdBy: data.createdBy,
          date: data.date,
          roleId: data.roleid,
          roleName: data.rolename,
        };
        batch.set(doc.ref, updatedData);
      }
    });

    await batch.commit();

    if (batch._ops.length === 0) {
      return { status: 204, message: "No documents were updated." };
    } else if (batch._ops.length > 100) {
      logger.info(
        `Warning: More than 100 Discord roles documents to update. The max limit permissible is 500. Refer https://github.com/Real-Dev-Squad/website-backend/issues/890 for more details.`
      );
    }
    return { status: 200, message: "Discord roles updated Successfully." };
  } catch (err) {
    logger.error("Error in updating Discord roles", err);
    return { status: 500, message: "Discord roles couldn't be updated Successfully." };
  }
};

module.exports = {
  createNewRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  isGroupRoleExists,
  migrateDiscordRole,
  migrateGroupRoleToMember,
};
