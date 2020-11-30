const logger = require('../utils/logger')
const config = require('config')
const { fetch } = require('../utils/fetch')
const { fetchUser } = require('../models/users')

/**
 * Fetches the pull requests in Real-Dev-Squad by user using GitHub API
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const fetchPRsByUser = async (id) => {
  try {
    const { user } = await fetchUser(id)
    const url = `${config.get('githubApi.baseUrl')}/search/issues?q=org:${config.get('githubApi.org')}+author:${user.github_id}+type:pr`
    return fetch(url)
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`)
    throw err
  }
}

module.exports = {
  fetchPRsByUser
}
