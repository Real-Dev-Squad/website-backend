/**
 * User's badges response
 * Multiple responses can be added to the object if required
 *
 * @return {Object}
 */

export const userFound = {
  userExists: true,
  userBadges: [{ title: "badgeTitle", description: "badgeDescription" }],
};

export const userNotFound = {
  userExists: false,
  userBadges: [],
};

export const badgesEmpty = {
  userExists: true,
  userBadges: [],
};

export default { userFound, userNotFound, badgesEmpty };
