const logger = require('../utils/logger')
const githubService = require('../services/githubService')

/**
 * Collects all pull requests and sends only required data for each pull request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getPRdetails = async (req, res) => {
  try {
    const { data } = await githubService.fetchPRsByUser(req.params.username)

    if (data.total_count) {
      const allPRs = []
      data.items.forEach(({ title, html_url: url, state, created_at: createdAt, updated_at: updatedAt, repository_url: repositoryUrl, draft, labels, assignees }) => {
        const allAssignees = assignees.map(object => object.login)
        const allLabels = labels.map(object => object.name)
        const repositoryUrlSplit = repositoryUrl.split('/')
        const repository = repositoryUrlSplit[repositoryUrlSplit.length - 1]
        allPRs.push({
          title,
          state,
          createdAt,
          updatedAt,
          repository,
          url,
          readyForReview: state === 'closed' ? false : !draft,
          labels: allLabels,
          assignees: allAssignees
        })
      })
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
    logger.error(`Error while processing pull requests: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Get stale PRs in open state for Real Dev Squad repos
 *
 * @param {Object} req
 * @param {Object} res
 * @todo create cache for RDS usernames <> github usernames
 */
const getStalePRs = async (req, res) => {
  try {
    const { data } = await githubService.fetchStalePRs()

    if (data.total_count) {
      const allPRs = []
      data.items.forEach(({
        title,
        html_url: url,
        state,
        created_at: createdAt,
        updated_at: updatedAt,
        draft,
        labels,
        user,
        assignees
      }) => {
        const allAssignees = assignees.map(object => object.login)
        const allLabels = labels.map(object => object.name)
        allPRs.push({
          title,
          state,
          createdAt,
          updatedAt,
          url,
          username: user.login,
          labels: allLabels,
          assignees: allAssignees
        })
      })
      return res.json({
        message: 'Stale PRs',
        pullRequests: allPRs
      })
    }
    return res.json({
      message: 'No pull requests found!',
      pullRequests: []
    })
  } catch (err) {
    logger.error(`Error while processing pull requests: ${err}`)
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
    
    const { data } = await githubService.fetchOpenPRs(req.query.page)

    if (data.total_count) {
      const allPRs = []
      data.items.forEach(({
        title,
        html_url: url,
        state,
        created_at: createdAt,
        updated_at: updatedAt,
        draft,
        labels,
        user,
        assignees
      }) => {
        const allAssignees = assignees.map(object => object.login)
        const allLabels = labels.map(object => object.name)
        allPRs.push({
          title,
          state,
          createdAt,
          updatedAt,
          url,
          username: user.login,
          labels: allLabels,
          assignees: allAssignees
        })
      })
      return res.json({
        message: 'Open PRs',
        pullRequests: allPRs
      })
    }
    return res.json({
      message: 'No pull requests found!',
      pullRequests: []
    })
  } catch (err) {
    logger.error(`Error while processing pull requests: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  getPRdetails,
  getStalePRs,
  getOpenPRs
}
