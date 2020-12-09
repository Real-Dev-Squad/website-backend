const logger = require('../utils/logger')
const config = require('config')
const { fetch } = require('../utils/fetch')
const { fetchUser } = require('../models/users')

/**
 * Fetches the pull requests in Real-Dev-Squad by user using GitHub API
 *
 * @param username {String} - Username String
 */

const fetchPRsByUser = async (username) => {
  try {
    const { user } = await fetchUser(username)
    const url = `${config.get('githubApi.baseUrl')}/search/issues?q=org:${config.get('githubApi.org')}+author:${user.github_id}+type:pr`
    return fetch(url, 'get', null, null, null, {
      auth: {
        username: config.get('githubOauth.clientId'),
        password: config.get('githubOauth.clientSecret')
      }
    })
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`)
    throw err
  }
}

module.exports = {
  fetchPRsByUser
}
