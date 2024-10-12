import { generateCloudFlareHeaders } from "../utils/discord-actions.js";
const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

export const sendTaskUpdate = async (completed, blockers, planned, userName, taskId, taskTitle) => {
  try {
    const headers = generateCloudFlareHeaders();
    const body = {
      content: {
        completed,
        blockers,
        planned,
        userName,
        taskId,
        taskTitle,
      },
    };
    await fetch(`${DISCORD_BASE_URL}/progress`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (error) {
    logger.error("Something went wrong", error);
    throw error;
  }
};
