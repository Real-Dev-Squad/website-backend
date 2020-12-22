const logger = require('../utils/logger')
const config = require('config')
const { fetch } = require('../utils/fetch')
const { fetchUser } = require('../models/users')

/**
 * Creates the custom API URL with the required params in the format
 * expected by Github
 * https://docs.github.com/en/free-pro-team@latest/rest/reference/search
 * @access private
 * @param {Object} searchParams - List of params to create github API URL
 * @param {Object} resultsOptions - Ordering and pagination of results
 */
const getGithubURL = (searchParams, resultsOptions = {}) => {
  const baseURL = config.get('githubApi.baseUrl')
  const issuesAndPRsPath = '/search/issues'

  const urlObj = new URL(baseURL)
  urlObj.pathname = issuesAndPRsPath

  const defaultParams = {
    org: config.get('githubApi.org'),
    type: 'pr'
  }

  const finalSearchParams = Object.assign({}, defaultParams, searchParams)

  const paramsObjArr = Object.entries(finalSearchParams)
  const paramsStrArr = paramsObjArr.map(([key, value]) => `${key}:${value}`)

  // The string that can be entrered as text on Github website for simple search
  const prsSearchText = paramsStrArr.join(' ')

  urlObj.searchParams.append('q', prsSearchText)

  // Manipulate returned results
  // e.g number of results, pagination, etc
  Object.entries(resultsOptions).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value)
  })

  const createdURL = urlObj.href
  return createdURL
}

/** Create the fetch object to call on github url
 * @access private
 * @param {string} url - URL on github to call
 */
function getFetch (url) {
  return fetch(url, 'get', null, null, null, {
    auth: {
      username: config.get('githubOauth.clientId'),
      password: config.get('githubOauth.clientSecret')
    }
  })
}

/**
 * Fetches the pull requests in Real-Dev-Squad by user using GitHub API
 * @param username {string} - Username String
 */

const fetchPRsByUser = async (username) => {
  try {
    const { user } = await fetchUser({ username })
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

/**
 * Fetches the oldest open N requests
 * @todo fetch N from query params
 */
const fetchOpenPRs = async () => {
  try {
    const url = getGithubURL({
      is: 'open'
    }, {
      sort: 'created',
      order: 'asc',
      per_page: 5,
      page: 1
    })
    return getFetch(url)
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`)
    throw err
  }
}

module.exports = {
  fetchPRsByUser,
  fetchOpenPRs
}
