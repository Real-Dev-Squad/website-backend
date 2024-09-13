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
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some_intensional_date", // ISO8601 timestamp
    nick: "david",
    pending: false,
    premium_since: null,
    roles: ["hero", "racer"],
    user: {
      id: "12345678909867666",
      username: "david",
      global_name: "david",
      display_name: "david",
      avatar: "56yu6567uuju7636w4e6yr7e4utbw8r4", // avatar hash
      discriminator: "4455", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some_intensional_date", // ISO8601 timestamp
    nick: "goliath",
    pending: false,
    premium_since: null,
    roles: ["giant", "hero"],
    user: {
      id: "123456",
      username: "goliath",
      global_name: "goliath",
      display_name: "goliath",
      avatar: "56yu6567uuju7636w4e6yr7e9utbw8r4", // avatar hash
      discriminator: "44551", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some_intensional_date", // ISO8601 timestamp
    nick: "goliath",
    pending: false,
    premium_since: null,
    roles: ["giant", "hero"],
    user: {
      id: "1234567",
      username: "goliath",
      global_name: "goliath",
      display_name: "goliath",
      avatar: "56yu6567uuju7636w4e6yr7e9utbw8r4", // avatar hash
      discriminator: "44551", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some_intensional_date", // ISO8601 timestamp
    nick: "goliath-1",
    pending: false,
    premium_since: null,
    roles: ["giant", "hero"],
    user: {
      id: "2131234453456545656765767876",
      username: "goliath-1",
      global_name: "goliath-1",
      display_name: "goliath-1",
      avatar: "56yu6567uuju7636w4e6yr7e9utbw8r4", // avatar hash
      discriminator: "44551", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
];

const usersFromRds = [
  {
    username: "nonArchivedAndInDiscord",
    first_name: "",
    last_name: "",
    github_id: "",
    github_display_name: "",
    incompleteUserDetails: false,
    discordId: "123456789098765432",
    roles: {
      in_discord: false,
      archived: false,
    },
  },
  {
    username: "nonArchivedAndInDiscord",
    first_name: "",
    last_name: "",
    github_id: "",
    github_display_name: "",
    incompleteUserDetails: false,
    discordId: "12345678909867666",
    roles: {
      in_discord: false,
      archived: false,
    },
  },
  {
    username: "archivedAndInDiscord",
    first_name: "",
    last_name: "",
    github_id: "",
    github_display_name: "",
    incompleteUserDetails: false,
    discordId: "12345678909867666",
    roles: {
      in_discord: true,
      archived: true,
    },
  },
  {
    username: "archivedAndNotInDiscord",
    first_name: "",
    last_name: "",
    github_id: "",
    github_display_name: "",
    incompleteUserDetails: false,
    discordId: "90438342",
    roles: {
      in_discord: true,
      archived: true,
    },
  },
  {
    username: "nonArchivedAndNotInDiscord",
    first_name: "",
    last_name: "",
    github_id: "",
    github_display_name: "",
    incompleteUserDetails: false,
    discordId: "457298342",
    roles: {
      in_discord: false,
      archived: false,
    },
    id: "nonArchivedAndNotInDiscord",
  },
];

const updatedNicknameResponse = {
  userAffected: {
    userId: "X0H3paYveEWh7Q2fPhor",
    username: "test-name-007",
    discordId: "1123566257019568232",
  },
  message: "User nickname changed successfully",
};

const getOnboarding31DPlusMembers = [
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some date", // ISO8601 timestamp
    nick: "jhon",
    pending: false,
    premium_since: null,
    roles: ["hero", "racer", "9876543210"],
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
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some_intensional_date", // ISO8601 timestamp
    nick: "david",
    pending: false,
    premium_since: null,
    roles: ["hero", "racer", "9876543210"],
    user: {
      id: "12345678909867666",
      username: "david",
      global_name: "david",
      display_name: "david",
      avatar: "56yu6567uuju7636w4e6yr7e4utbw8r4", // avatar hash
      discriminator: "4455", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some_intensional_date", // ISO8601 timestamp
    nick: "goliath",
    pending: false,
    premium_since: null,
    roles: ["giant", "hero", "9876543210"],
    user: {
      id: "123456",
      username: "goliath",
      global_name: "goliath",
      display_name: "goliath",
      avatar: "56yu6567uuju7636w4e6yr7e9utbw8r4", // avatar hash
      discriminator: "44551", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
  {
    avatar: "",
    communication_disabled_until: "",
    flags: 0,
    is_pending: false,
    joined_at: "some_intensional_date", // ISO8601 timestamp
    nick: "john",
    pending: false,
    premium_since: null,
    // eslint-disable-next-line no-loss-of-precision
    roles: ["9876543210", "11334336"],
    user: {
      id: "9653710123456",
      username: "john",
      global_name: "john",
      display_name: "john",
      avatar: "56yu6567uuju7636w4e6yr7e9utbw8r4", // avatar hash
      discriminator: "4451", // 4-digit discord-tag
      public_flags: 0,
      avatar_decoration: null,
    },
    mute: false,
    deaf: false,
  },
];

module.exports = {
  getDiscordMembers,
  usersFromRds,
  updatedNicknameResponse,
  getOnboarding31DPlusMembers,
};
