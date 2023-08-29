const { generateAuthTokenForCloudflare } = require("../utils/discord-actions");

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const updateDiscordUserNickname = async (discordId: string, userName: string) => {
  try {
    const authToken = generateAuthTokenForCloudflare();
    const response = await fetch(`${DISCORD_BASE_URL}/guild/member`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ discordId, userName }),
    });
    if (!response.ok) {
      throw new Error("Could not update nickname");
    }

    await response.text();
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports = {
  updateDiscordUserNickname,
};
