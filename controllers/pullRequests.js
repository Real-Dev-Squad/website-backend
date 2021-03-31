const githubService = require('../services/githubService')

/**
 * Get Latest PRs in open or stale state for Real Dev Squad repos
 *
 * @param {boolean} isOpen boolean value indication open or stale
 * Get stale PRs in open state for Real Dev Squad repos
 */
const getPRs = async (page = 1, n = 10, isOpen = true, username = null) => {
  try {
    const { data } = await githubService.fetchPRs(page, n, isOpen)
    if (!data.total_count) {
      return []
    }
    return githubService.extractPRdetails(data)
  } catch (err) {
    logger.error(`Error while processing pull requests: ${err}`)
    throw err
  }
}

/**
 * Collects all pull requests and sends only required data for each pull request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserPRs = async (req, res) => {
  try {
    const { username } = req.params
    const { data } = await githubService.fetchPRsByUser(username)

    if (data.total_count) {
      const allPRs = githubService.extractPRdetails(data)
      return res.json({
        message: 'Pull requests returned successfully!',
        pullRequests: allPRs
      })
    }
    return res.json({
      message: 'No pull requests found!',
      pullRequests: []
    })
  } catch (err) {
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Get Latest PRs in stale state for Real Dev Squad repos
 *
 * @param {Object} req
 * @param {Object} res
 * @todo create cache for RDS usernames <> github usernames
 */
const getStalePRs = async (req, res) => {
  try {
    const { page, n } = req.query

    let message
    const isOpen = false
    const prs = await getPRs(page, n, isOpen)

    if (prs.length) {
      message = 'Stale PRs'
    } else {
      message = 'No pull requests found!'
    }

    return res.json({
      message: message,
      pullRequests: prs
    })
  } catch (err) {
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Get Latest PRs in open state for Real Dev Squad repos
 *
 * @param {Object} req
 * @param {Object} res
 * @todo create cache for RDS usernames <> github usernames
 */
const getOpenPRs = async (req, res) => {
  try {
    const { page, n } = req.query

    let message
    const prs = await getPRs(page, n)

    if (prs) {
      message = 'Open PRs'
    } else {
      message = 'No pull requests found!'
    }

    return res.json({
      message: message,
      pullRequests: prs
    })
  } catch (err) {
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  getUserPRs,
  getStalePRs,
  getOpenPRs
}
