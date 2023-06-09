const getDiscordMembers = [
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some date", // ISO8601 timestamp
    nick: "jhon",
    pending: false,
    premium_since: null,
    roles: ["hero", "racer"],
    user: {
      id: "123456789098765432",
      username: "jhondoe",
      global_name: "jhondoe",
      display_name: "jhondoe",
      avatar: "56yu6567uuju7636w4e6yr7e4utbw8r4", // avatar hash
      discriminator: "4455", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
];

module.exports = {
  getDiscordMembers,
};
