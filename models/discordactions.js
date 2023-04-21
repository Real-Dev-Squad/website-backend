const firestore = require("../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");

/**
 *
 * @param roleData { Object }: Data of the new role
 * @returns {Promise<discordRoleModel|Object>}
 */

const addNewRole = async (roleData) => {
  try {
    const alreadyIsRole = await discordRoleModel.where("rolename", "==", roleData.rolename).limit(1).get();
    if (!alreadyIsRole.empty) {
      const oldRole = [];
      alreadyIsRole.forEach((role) => oldRole.push(role.data()));
      return { id: oldRole[0].id, roleData: oldRole[0], wasSuccess: false };
    }
    const { id } = await discordRoleModel.add(roleData);
    return { id, roleData, wasSuccess: true };
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

module.exports = {
  addNewRole,
  getAllGroupRoles,
};
