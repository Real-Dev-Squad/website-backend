module.exports = () => {
  return [
    {
      type: "discord",
      token: "<TOKEN>",
      attributes: {
        discordId: 121201,
        expiry: 1674041460211,
        username: "test",
        picture: "https://cdn.discordapp.com/avatars/123/123.png",
      },
    },
    {
      // Bad Data
      type: "discord",
      token: 123,
      attributes: {
        discordId: 121202,
        expiry: 1674041460211,
      },
    },
    {
      type: "discord",
      token: "<TOKEN>",
      attributes: {
        discordId: 121203,
        expiry: Date.now() + 600000,
      },
    },
    {
      type: "discord",
      token: "<TOKEN_1>",
      attributes: {
        discordId: 121204,
        expiry: Date.now() - 600000,
      },
    },
  ];
};
