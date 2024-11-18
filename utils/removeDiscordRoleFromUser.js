const discordRolesModel = require("../models/discordactions");
const discordServices = require("../services/discordService");
const { logType } = require("../constants/logs");
const { addLog } = require("../models/logs");

/**
 * Removes a Discord role from a user using Discord Id.
 *
 * @param {Object} userData - User data.
 * @param {string} discordId - User's Discord ID.
 * @param {string} roleid - Discord Role ID.
 *
 * @returns {Promise<Object>} - Result with success status and message.
 */
export const removeDiscordRoleFromUser = async (userData, discordId, roleid) => {
  try {
    const role = await discordRolesModel.isGroupRoleExists({ roleid });

    if (!role.roleExists) {
      throw new Error("Role doesn't exist");
    }

    const roleData = role.existingRoles.docs[0].data();

    await discordServices.removeRoleFromUser(roleData.roleid, discordId, userData);

    const { wasSuccess } = await discordRolesModel.removeMemberGroup(roleData.roleid, discordId);
    if (!wasSuccess) {
      throw new Error("Role deletion failed");
    }

    await addLog(
      logType.REMOVE_UNVERIFIED_ROLE,
      { roleid, userid: discordId },
      { message: "Unverified role removed successfully" }
    );

    return { success: true, message: "Role deleted successfully" };
  } catch (error) {
    logger.error(`Error removing role ${roleid} for user ${discordId}: ${error.message}`);

    return { success: false, message: error.message };
  }
};
