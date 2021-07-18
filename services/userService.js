const { set, get } = require('./cacheService')
const {
  fetchUser
} = require('../models/users')
const userCacheTTL = config.get('cache.ttl.userCache')

const cacheUser = (user) => {
  if (!user) {
    return false
  }

  set(`user:${user.id}`, user, userCacheTTL)
  set(`user:${user.github_id}`, user, userCacheTTL)
  set(`user:${user.username}`, user, userCacheTTL)
  return true
}

const getGitHubUsername = async (username) => {
  const cachedUser = get(`user:${username}`)
  if (cachedUser) {
    return cachedUser.github_id
  }

  const { userExists, user } = await fetchUser({
    username
  })

  if (userExists) {
    cacheUser(user)
    return user.github_id
  }
  return null
}

module.exports = {
  getGitHubUsername,
  cacheUser
}
