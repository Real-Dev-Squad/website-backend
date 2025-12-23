const jwt = require("jsonwebtoken");
const config = require("config");

const rawBaseUrl = config.get("services.discordBot.baseUrl");
const DISCORD_BASE_URL = rawBaseUrl && rawBaseUrl !== "DISCORD_BASE_URL" ? rawBaseUrl : "http://localhost:8080";

/**
 * Extracts the discord data of a user
 * @param discordId {String} - User discordId
 */

const getDiscordMemberDetails = async (discordId) => {
  try {
    const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
      algorithm: "RS256",
      expiresIn: config.get("rdsServerlessBot.ttl"),
    });

    const memberDiscordDetails = await (
      await fetch(`${DISCORD_BASE_URL}/member/${discordId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      })
    ).json();
    return memberDiscordDetails;
  } catch (err) {
    logger.error(`Error while fetching discord data of the member: ${err}`);
    throw err;
  }
};

module.exports = { getDiscordMemberDetails };
