/**
 * Ensures the provided user fixture represents an active Discord member.
 *
 * @param {object} user - Original user fixture.
 * @returns {object} Updated fixture with archived: false and in_discord: true.
 */
const withDiscordMembership = (user = {}) => ({
  ...user,
  roles: { ...(user.roles || {}), archived: false, in_discord: true },
});

module.exports = withDiscordMembership;
