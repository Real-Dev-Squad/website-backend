const { set, get } = require('./cacheService')
const {
  fetchUser
} = require('../models/users')

const cacheUser = (user) => {
  if (!user) {
    return false
  }
  const userObject = {
    github_id: user.github_id,
    id: user.id,
    username: user.username
  }
  set(user.id, userObject)
  set(user.github_id, userObject)
  set(user.username, userObject)
  return true
}

const getGitHubUsername = async (RDSUsername) => {
  const gitHubUserName = await get(RDSUsername)
  if (gitHubUserName) {
    return gitHubUserName
  }

  const { userExists, user } = fetchUser({
    username: RDSUsername
  })
  if (userExists) {
    cacheUser(user)
    return user.github_id
  }
  return null
}

module.exports = {
  getGitHubUsername
}
