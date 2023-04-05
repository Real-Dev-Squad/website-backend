module.exports = () => {
  return [
    {
      type: "discord",
      token: "<TOKEN>",
      attributes: {
        discordId: "<DISCORD_ID>",
        expiry: 1674041460211,
      },
    },
    {
      // Bad Data
      type: "discord",
      token: 123,
      attributes: {
        discordId: "<DISCORD_ID>",
        expiry: 1674041460211,
      },
    },
    {
      type: "discord",
      token: "<TOKEN>",
      attributes: {
        discordId: "<DISCORD_ID>",
        expiry: Date.now() + 600000,
      },
    },
    {
      type: "discord",
      token: "<TOKEN_1>",
      attributes: {
        discordId: "<DISCORD_ID>",
        expiry: Date.now() - 600000,
      },
    },
  ];
};
