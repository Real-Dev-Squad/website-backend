const { fetch: rdsFetch } = require('../utils/fetch')
const { fetchUser } = require('../models/users')

/**
 * Extracts only the necessary details required from the object returned by Github API
 * @param data {Object} - Object returned by Github API
 */
const extractPRdetails = (data) => {
  const allPRs = []
  data.items.forEach(
    ({
      title,
      user,
      html_url: url,
      state,
      created_at: createdAt,
      updated_at: updatedAt,
      repository_url: repositoryUrl,
      labels,
      assignees
    }) => {
      const allAssignees = assignees.map((assignee) => assignee.login)
      const allLabels = labels.map((label) => label.name)
      const repository = repositoryUrl.split('/').pop()
      allPRs.push({
        title,
        username: user.login,
        state,
        createdAt,
        updatedAt,
        repository,
        url,
        labels: allLabels,
        assignees: allAssignees
      })
    }
  )
  return allPRs
}

/**
 * Creates the custom API URL with the required params in the format
 * expected by Github
 * https://docs.github.com/en/free-pro-team@latest/rest/reference/search
 * @access private
 * @param searchParams {Object} - List of params to create github API URL
 * @param resultsOptions {Object} - Ordering and pagination of results
 */
const getGithubURL = (searchParams, resultsOptions = {}) => {
  const baseURL = config.get('githubApi.baseUrl')
  const issuesAndPRsPath = '/search/issues'

  const urlObj = new URL(baseURL)
  urlObj.pathname = issuesAndPRsPath

  const finalSearchParams = {
    org: config.get('githubApi.org'),
    type: 'pr',
    ...searchParams
  }

  // The string that can be entered as text on Github website for simple search
  let prsSearchText = ''
  for (const [key, value] of Object.entries(finalSearchParams)) {
    prsSearchText += `${key}:${value} `
  }
  urlObj.searchParams.append('q', prsSearchText.trim())

  // Manipulate returned results
  // e.g number of results, pagination, etc
  for (const [key, value] of Object.entries(resultsOptions)) {
    urlObj.searchParams.append(key, value)
  }

  const createdURL = urlObj.href
  return createdURL
}

/**
 * Create the fetch object to call on github url
 * @access private
 * @param url {string} - URL on github to call
 */
function fetchGithub (url) {
  const options = {
    auth: {
      username: config.get('githubOauth.clientId'),
      password: config.get('githubOauth.clientSecret')
    }
  }
  return rdsFetch(url, 'get', null, null, null, options)
}

/**
 * Fetches the pull requests in Real-Dev-Squad by user using GitHub API
 * @param username {string} - Username String
 */
const fetchPRsByUser = async (username) => {
  try {
    const { user } = await fetchUser({ username })
    const url = getGithubURL({ author: user.github_id })
    return fetchGithub(url)
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`)
    throw err
  }
}

/**
 * Fetches the latest 10 open PRs
 * @param pageNumber pagination page number
 * @param perPage number of entries per page
 * @param isOpen boolean checking for open or stale PRs
 */
const fetchPRs = async ({ pageNumber = 1, perPage = 10, isOpen = true, username = null }) => {
  try {
    const searchParams = { is: 'open' }
    if (username) {
      const user = await fetchUser({ username })
      searchParams.author = user.github_id
    }

    const url = getGithubURL(
      searchParams,
      {
        sort: 'created',
        order: isOpen ? 'desc' : 'asc',
        per_page: perPage,
        page: pageNumber
      }
    )
    return fetchGithub(url)
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`)
    throw err
  }
}

module.exports = {
  fetchPRsByUser,
  fetchPRs,
  extractPRdetails
}
