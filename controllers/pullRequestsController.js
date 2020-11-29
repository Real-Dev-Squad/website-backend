const logger = require('../utils/logger')
const config = require('config')
const githubService = require('../services/githubService')
const { fetchUser } = require('../models/users')

/**
 * Fetches the pull requests in Real-Dev-Squad by user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getPullRequests = async (req, res) => {
  try {
    const { user } = await fetchUser(req.params.id)
    const url = `${config.githubApi.baseUrl}/search/issues?q=org:${config.githubApi.org}+author:${user.github_id}+type:pr`
    const { data } = await githubService.fetch(url)

    if (data.total_count) {
      const allPRs = []
      data.items.forEach(({ title, html_url: htmlUrl, state, created_at: createdAt, updated_at: updatedAt, draft, labels, assignees }) => {
        const allAssignees = githubService.getNames(assignees, 'login')
        const allLabels = githubService.getNames(labels, 'name')
        allPRs.push({
          title: title,
          url: htmlUrl,
          state: state,
          created_at: createdAt,
          updated_at: updatedAt,
          ready_for_review: state === 'closed' ? false : !draft,
          labels: allLabels,
          assignees: allAssignees
        })
      })
      return res.json(allPRs)
    }
    return res.json('No pull requests found!')
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  getPullRequests
}
