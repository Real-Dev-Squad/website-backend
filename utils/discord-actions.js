const jwt = require("jsonwebtoken");
const { getDiscordMemberDetails } = require("../services/discordMembersService");

const generateAuthTokenForCloudflare = async () => {
  const expiry = config.get("rdsServerlessBot.ttl");
  const privateKey = config.get("rdsServerlessBot.rdsServerLessPrivateKey");
  const authToken = await jwt.sign({}, privateKey, {
    algorithm: "RS256",
    expiresIn: expiry,
  });
  return authToken;
};

const generateDiscordProfileImageUrl = async (discordId) => {
  try {
    const { user: discordUserData } = await getDiscordMemberDetails(discordId);
    let discordAvatarUrl = "";
    if (discordUserData) {
      // CREATING/FETCHING THE USER'S DISCORD PROFILE PHOTO URL
      discordAvatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${discordUserData?.avatar}.png`;
    }
    return discordAvatarUrl;
  } catch (error) {
    logger.error("Something went wrong", error);
    throw error;
  }
};

module.exports = {
  generateDiscordProfileImageUrl,
  generateAuthTokenForCloudflare,
};
