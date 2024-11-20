const discordRolesModel = require("../models/discordactions");
const discordServices = require("../services/discordService");
const { logType } = require("../constants/logs");
const { addLog } = require("../models/logs");

/**
 * Removes a Discord role from a user using Discord Id.
 *
 * @param {Object} userData - User data.
 * @param {string} discordId - User's Discord ID.
 * @param {string} roleId - Discord Role ID.
 *
 * @returns {Promise<Object>} - Result with success status and message.
 */
export const removeDiscordRoleFromUser = async (userData, discordId, roleId) => {
  try {
    const { roleExists } = await discordRolesModel.isGroupRoleExists({ roleid: roleId });

    if (!roleExists) {
      throw new Error("Role doesn't exist");
    }

    await discordServices.removeRoleFromUser(roleId, discordId, userData);

    const { wasSuccess } = await discordRolesModel.removeMemberGroup(roleId, discordId);
    if (!wasSuccess) {
      throw new Error("Role deletion failed");
    }

    await addLog(
      logType.REMOVE_ROLE_FROM_USER,
      { roleId, userid: discordId },
      { message: "Role removed successfully from user" }
    );

    return { success: true, message: "Role deleted successfully" };
  } catch (error) {
    logger.error(`Error removing role ${roleId} for user ${discordId}: ${error.message}`);

    return { success: false, message: error.message };
  }
};
