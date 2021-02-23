const users = require('../../models/users')

// Import fixtures
const userData = require('../fixtures/user/user')()

/**
 * File to be required in every test file where userId is required to generate the JWT
 *
 * @return {string} userId - userId for the added user
 */
module.exports = async (user) => {
  user = user && Object.keys(user).length === 0 && user.constructor === Object

  // Use the user data sent as arguments, else use data from fixtures
  user = user || userData[0]

  const { userId } = await users.addOrUpdate(user)

  return userId
}
