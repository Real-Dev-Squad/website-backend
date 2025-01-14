const jwt = require("jsonwebtoken");
const config = require("config");
const { getDiscordMemberDetails } = require("../services/discordMembersService");
const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");
const RDS_SERVERLESS_PRIVATE_KEY = config.get("rdsServerlessBot.rdsServerLessPrivateKey");
const RDS_SERVERLESS_TTL = config.get("rdsServerlessBot.ttl");

const generateAuthTokenForCloudflare = () => {
  const expiry = config.get("rdsServerlessBot.ttl");
  const privateKey = config.get("rdsServerlessBot.rdsServerLessPrivateKey");
  const authToken = jwt.sign({}, privateKey, {
    algorithm: "RS256",
    expiresIn: expiry,
  });
  return authToken;
};
const generateCloudFlareHeaders = ({ username, id } = {}) => {
  const authToken = generateAuthTokenForCloudflare();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };
  if (username && id) {
    headers["X-Audit-Log-Reason"] = `Action initiator's username=>${username} and id=${id}`;
  }
  return headers;
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

const generateDiscordInviteLink = async () => {
  try {
    const channelId = config.get("discordNewComersChannelId");
    const authToken = jwt.sign({}, RDS_SERVERLESS_PRIVATE_KEY, {
      algorithm: "RS256",
      expiresIn: RDS_SERVERLESS_TTL,
    });

    const inviteOptions = {
      channelId: channelId,
    };
    const response = await fetch(`${DISCORD_BASE_URL}/invite`, {
      method: "POST",
      body: JSON.stringify(inviteOptions),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const discordInviteResponse = await response.json();

    const inviteCode = discordInviteResponse.data.code;
    const inviteLink = `discord.gg/${inviteCode}`;
    return inviteLink;
  } catch (error) {
    logger.error("Something went wrong", error);
    throw error;
  }
};

module.exports = {
  generateDiscordProfileImageUrl,
  generateAuthTokenForCloudflare,
  generateCloudFlareHeaders,
  generateDiscordInviteLink,
};
