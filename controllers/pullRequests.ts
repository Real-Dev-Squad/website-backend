// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'githubServ... Remove this comment to see the full error message
const githubService = require('../services/githubService')

/**
 * Collects all pull requests and sends only required data for each pull request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUserPRs = async (req: any, res: any) => {
  try {
    const { data } = await githubService.fetchPRsByUser(req.params.username)

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
const getStalePRs = async (req: any, res: any) => {
  try {
    const { size, page } = req.query
    const { data } = await githubService.fetchStalePRs(size, page)

    if (data.total_count) {
      const allPRs = githubService.extractPRdetails(data)
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
const getOpenPRs = async (req: any, res: any) => {
  try {
    const { size, page } = req.query
    const { data } = await githubService.fetchOpenPRs(size, page)

    if (data.total_count) {
      const allPRs = githubService.extractPRdetails(data)
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  getUserPRs,
  getStalePRs,
  getOpenPRs
}
