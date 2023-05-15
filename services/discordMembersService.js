const jwt = require("jsonwebtoken");

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const getDiscordMemberDetails = async (discordId) => {
  try {
    const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
      algorithm: "RS256",
      expiresIn: config.get("rdsServerlessBot.ttl"),
    });

    const memberDetails = await fetch(`${DISCORD_BASE_URL}/member/${discordId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    }).then((response) => response.json());
    return memberDetails;
  } catch (err) {
    logger.error(`Error while creating new Role: ${err}`);
    throw err;
  }
};

module.exports = getDiscordMemberDetails;
