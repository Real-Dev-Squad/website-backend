// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'users'.
const users = require('../../models/users')

// Import fixtures
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()

/**
 * File to be required in every test file where userId is required to generate the JWT
 *
 * @return {string} userId - userId for the added user
 */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = async (user: any) => {
  const isValid = user && Object.keys(user).length !== 0 && user.constructor === Object
  // Use the user data sent as arguments, else use data from fixtures
  user = isValid ? user : userData[0]
  const { userId } = await users.addOrUpdate(user)

  return userId
}
