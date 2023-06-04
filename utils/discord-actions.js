const { getDiscordMemberDetails } = require("../services/discordMembersService");

const generateDiscordProfileImageUrl = async (discordId) => {
  const { user: discordUserData } = await getDiscordMemberDetails(discordId);
  let discordAvatarUrl = "";
  if (discordUserData) {
    // CREATING/FETCHING THE USER'S DISCORD PROFILE PHOTO URL
    discordAvatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${discordUserData?.avatar}.png`;
  }
  return discordAvatarUrl;
};

module.exports = {
  generateDiscordProfileImageUrl,
};
