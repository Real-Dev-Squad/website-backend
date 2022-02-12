/**
 * User's badges response
 * Multiple responses can be added to the object if required
 *
 * @return {Object}
 */

const userFound = {
  userExists: true,
  userBadges: [{ title: "badgeTitle", description: "badgeDescription" }],
};

const userNotFound = {
  userExists: false,
  userBadges: [],
};

const badgesEmpty = {
  userExists: true,
  userBadges: [],
};

module.exports = { userFound, userNotFound, badgesEmpty };
