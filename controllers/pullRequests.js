const githubService = require('../services/githubService')

/**
 * Get Latest PRs in open or stale state for Real Dev Squad repos
 *
 * @param {boolean} page page number to retrieve
 * @param {boolean} perPage number of PRs per page
 * @param {boolean} isOpen boolean value indication open or stale
 * @param {string} username retrieve PRs of username
 *
 * @returns {Array} List of PRs based on provided conditions
 */
const getPRs = async ({ page = 1, perPage = 10, isOpen = true, username = null }) => {
  try {
    const { data } = await githubService.fetchPRs({ page, perPage, isOpen, username })
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

    let message
    const prs = await getPRs({ username })

    if (prs.length) {
      message = 'User PRs'
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
 * Get Latest PRs in stale state for Real Dev Squad repos
 *
 * @param {Object} req
 * @param {Object} res
 * @todo create cache for RDS usernames <> github usernames
 */
const getStalePRs = async (req, res) => {
  try {
    const { page, n: perPage } = req.query

    let message
    const isOpen = false
    const prs = await getPRs({ page, perPage, isOpen })

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
    const { page, n: perPage } = req.query

    let message
    const prs = await getPRs({ page, perPage })

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
