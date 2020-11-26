const logger = require('./logger')
const userQuery = require('../models/users')

const getGithubId = async (id) => {
  try {
    const details = await userQuery.fetchUser(id)
    return (details.user.github_id)
  } catch (err) {
    logger.error(`Error while fetching user: ${err}`)
    throw err
  }
}

module.exports = getGithubId
