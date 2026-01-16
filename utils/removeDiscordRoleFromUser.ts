import { logType } from "../constants/logs";
import discordActions from "../models/discordactions";
import { addLog } from "../models/logs";
import discordServices from "../services/discordService";
import { userData } from "../types/global";

const logger = require("./logger");

/**
 * Removes a Discord role from a user using Discord Id.
 *
 * @param {Object} userData - User data.
 * @param {string} discordId - User's Discord ID.
 * @param {string} roleId - Discord Role ID.
 *
 * @returns {Promise<{ success: boolean; message: string }>} - Result with success status and message.
 */
export const removeDiscordRoleFromUser = async (
  userData: userData,
  discordId: string,
  roleId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { roleExists } = await discordActions.isGroupRoleExists({ roleid: roleId, rolename: null });

    if (!roleExists) {
      const message = "Role doesn't exist";
      await addLog(logType.REMOVE_ROLE_FROM_USER_FAILED, { roleId }, { message, userid: discordId, userData });
      throw new Error(message);
    } 
    
    try {
      await discordServices.removeRoleFromUser(roleId, discordId, userData);
    } catch (error) {
      const message = "Role deletion from discord failed";
      await addLog(logType.REMOVE_ROLE_FROM_USER_FAILED, { roleId, userid: discordId, userData }, { message });
      throw new Error(message);
    }

    const userDiscordRoles = await discordActions.getGroupRolesForUser(discordId);
    const userHasUnverifiedRole = userDiscordRoles.groups.some((group: { roleId: string }) => group.roleId === roleId);

    if (userHasUnverifiedRole) {
      const deleteResponse = await discordActions.removeMemberGroup(roleId, discordId);
      if (deleteResponse && !deleteResponse.wasSuccess) {
        const message = "Role deletion from database failed";
        await addLog(logType.REMOVE_ROLE_FROM_USER_FAILED, { roleId, userid: discordId }, { message, userData });
        throw new Error(message);
      }
    }

    await addLog(
      logType.REMOVE_ROLE_FROM_USER_SUCCESS,
      { roleId, userid: discordId },
      { message: "Role removed successfully from user", userData }
    );

    return { success: true, message: "Role deleted successfully" };
  } catch (error) {
    logger.error(`Error removing role ${roleId} for user ${discordId}: ${error.message}`);

    return { success: false, message: error.message };
  }
};
