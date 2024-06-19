module.exports = () => {
  return [
    {
      type: "discord",
      token: "<TOKEN>",
      attributes: {
        userName: "<USER_NAME>",
        discriminator: "<DISCRIMINATOR>",
        userAvatar: "<USER_AVATAR>",
        discordId: "<DISCORD_ID>",
        discordJoinedAt: "<DISCORD_JOINED_AT>",
        expiry: 1674041460211,
      },
    },
    {
      // Bad Data
      type: "discord",
      token: 123,
      attributes: {
        userName: "<USER_NAME>",
        discriminator: "<DISCRIMINATOR>",
        userAvatar: "<USER_AVATAR>",
        discordId: "<DISCORD_ID>",
        discordJoinedAt: "<DISCORD_JOINED_AT>",
        expiry: 1674041460211,
      },
    },
    {
      type: "discord",
      token: "<TOKEN>",
      attributes: {
        userName: "<USER_NAME>",
        discriminator: "<DISCRIMINATOR>",
        userAvatar: "<USER_AVATAR>",
        discordId: "<DISCORD_ID>",
        discordJoinedAt: "<DISCORD_JOINED_AT>",
        expiry: Date.now() + 600000,
      },
    },
    {
      type: "discord",
      token: "<TOKEN_1>",
      attributes: {
        userName: "<USER_NAME>",
        discriminator: "<DISCRIMINATOR>",
        userAvatar: "<USER_AVATAR>",
        discordId: "<DISCORD_ID>",
        discordJoinedAt: "<DISCORD_JOINED_AT>",
        expiry: Date.now() - 600000,
      },
    },
  ];
};
