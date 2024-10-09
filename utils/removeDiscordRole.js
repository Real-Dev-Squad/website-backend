const discordRolesModel = require("../models/discordactions");
const discordServices = require("../services/discordService");

/**
 * Removes a Discord role from a user, handling cases where either "roleid", "rolename", or both are provided.
 *
 * @param {Object} userData - User data.
 * @param {string} discordId - User's Discord ID.
 * @param {string} roleid - Role ID. If not provided, defaults to "undefined".
 * @param {string} rolename - Role name. If not provided, defaults to "undefined".
 *
 * @returns {Promise<Object>} - Result with success status and message.
 */
const removeDiscordRole = async (userData, discordId, roleid, rolename) => {
  try {
    const role = await discordRolesModel.isGroupRoleExists({ roleid, rolename });

    if (!role.roleExists) {
      throw new Error("Role doesn't exist");
    }

    const roleData = role.existingRoles.docs[0].data();

    await discordServices.removeRoleFromUser(roleData.roleid, discordId, userData);

    const { wasSuccess } = await discordRolesModel.removeMemberGroup(roleData.roleid, discordId);
    if (!wasSuccess) {
      throw new Error("Role deletion failed");
    }

    return { success: true, message: "Role deleted successfully" };
  } catch (error) {
    logger.error(`Error removing role ${rolename || roleid} for user ${discordId}: ${error.message}`);

    return { success: false, message: error.message };
  }
};

module.exports = { removeDiscordRole };
