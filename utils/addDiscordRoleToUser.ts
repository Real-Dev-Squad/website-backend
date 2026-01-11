import { logType } from "../constants/logs";
import { addLog } from "../models/logs";
import discordServices from "../services/discordService";

const logger = require("./logger");

/**
 * Adds a Discord role to a user using Discord Id.
 *
 * @param {string} discordId - User's Discord ID.
 * @param {string} roleId - Discord Role ID.
 * @param {string} roleName - Role name for logging purposes.
 *
 * @returns {Promise<{ success: boolean; message: string }>} - Result with success status and message.
 */
export const addDiscordRoleToUser = async (
    discordId: string,
    roleId: string,
    roleName: string = "role"
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await discordServices.addRoleToUser(discordId, roleId);

        if (!response.success) {
            const message = `Adding ${roleName} role to discord failed: ${response.message || "Unknown error"}`;
            await addLog(logType.ADD_ROLE_TO_USER_FAILED, { roleId, discordId }, { message });
            return { success: false, message };
        }

        await addLog(
            logType.ADD_ROLE_TO_USER_SUCCESS,
            { roleId, discordId },
            { message: `${roleName} role added successfully to user` }
        );

        return { success: true, message: `${roleName} role added successfully` };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Error adding role ${roleId} for user ${discordId}: ${msg}`);
        await addLog(logType.ADD_ROLE_TO_USER_FAILED, { roleId, discordId }, { message: msg });

        return { success: false, message: msg };
    }
};
