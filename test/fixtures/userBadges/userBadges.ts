/**
 * User's badges response
 * Multiple responses can be added to the object if required
 *
 * @return {Object}
 */

const userFound = {
  userExists: true,
  userBadges: [{ title: 'badgeTitle', description: 'badgeDescription' }]
}

const userNotFound = {
  userExists: false,
  userBadges: []
}

const badgesEmpty = {
  userExists: true,
  userBadges: []
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { userFound, userNotFound, badgesEmpty }
