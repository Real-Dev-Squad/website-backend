const {
  getCache
} = require('./cacheService')
const {
  fetchUser
} = require('../models/users')

const getGitHubUsername = async (RDSUsername) => {
  return Promise.any(
    getCache(RDSUsername),
    fetchUser({
      username: RDSUsername
    })
  )
}

const getRDSUsername = async (gitHubUsername) => {
  return Promise.any(
    getCache(gitHubUsername),
    () => 'GitHub_Username'
  )
  // ToDo: Define getGitHubUsernameFromDatabase(gitHubUsername)
}

module.exports = {
  getGitHubUsername,
  getRDSUsername
}
