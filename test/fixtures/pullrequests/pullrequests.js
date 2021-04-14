const githubPRInfo = require('../contributions/githubPRInfo')()

/**
 * Mocking response from GitHub APIs for open pull requests
 * These are open PRs in descending order (newest first)
 *
 * @return {Object}
 */
const getOpenPRs = () => {
  const allPRs = githubPRInfo.prakash.data.items
  const openPRs = allPRs.filter((pullrequest) => pullrequest.state === 'open')
  const data = {
    total_count: openPRs.length,
    incomplete_results: false,
    items: openPRs
  }
  return { data }
}

/**
 * Mocking response from GitHub APIs for stale pull requests
 * These are open PRs in asending order (oldest first)
 *
 * @return {Object}
 */
const getStalePRs = () => {
  const openPRsData = getOpenPRs()
  const { data: { items } } = openPRsData
  const stalePRs = items.sort((a, b) => (new Date(a.created_at)).getTime() - (new Date(b.created_at)).getTime())
  const data = {
    total_count: stalePRs.length,
    incomplete_results: false,
    items: stalePRs
  }
  return { data }
}

// These are the keys of the object returned by pull requests APIs
const pullRequestKeys = ['title', 'username', 'state', 'createdAt', 'updatedAt', 'repository', 'url', 'labels', 'assignees']

module.exports = { getOpenPRs, getStalePRs, pullRequestKeys }
