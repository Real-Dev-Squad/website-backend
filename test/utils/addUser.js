const users = require('../../models/users')

// Import fixtures
const githubUserInfo = require('../fixtures/auth/githubUserInfo')()

/**
 * File to be required in every test file where userId is required to generate the JWT
 *
 * @return {string} userId - userId for the added user
 */
module.exports = async () => {
  const userData = {
    username: 'ankur',
    github_id: githubUserInfo[0].username,
    github_display_name: githubUserInfo[0].displayName,
    tokens: {
      githubAccessToken: 'githubAccessToken'
    }
  }

  const { userId } = await users.addOrUpdate(userData)
  return userId
}
