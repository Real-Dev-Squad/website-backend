import { generateCloudFlareHeaders } from "../utils/discord-actions.js";
const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

export const sendTaskUpdate = async (completed, blockers, planned) => {
  try {
    const headers = generateCloudFlareHeaders();
    const body = {
      content: {
        completed,
        blockers,
        planned,
      },
    };
    await fetch(`${DISCORD_BASE_URL}/task/update`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (error) {
    logger.error("Something went wrong", error);
    throw error;
  }
};
