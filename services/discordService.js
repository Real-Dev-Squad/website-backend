const jwt = require("jsonwebtoken");

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const getDiscordMembers = async () => {
  const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
    algorithm: "RS256",
    expiresIn: config.get("rdsServerlessBot.ttl"),
  });

  const response = await (
    await fetch(`${DISCORD_BASE_URL}/discord-members`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    })
  ).json();
  return response;
};

module.exports = {
  getDiscordMembers,
};
