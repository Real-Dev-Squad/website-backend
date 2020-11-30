const logger = require('../utils/logger')
const githubService = require('../services/githubService')

/**
 * Loops over an array of objects, takes a value corresponding to key provided and saves it in an array
 *
 * @param arrayOfObjects {Array} - Array of objects to loop over
 * @param key {String} - Value corresponding to this key is saved
 */

const getNames = (arrayOfObjects, key) => {
  const names = []
  arrayOfObjects.forEach((object) => {
    names.push(object[key])
  })
  return names
}

/**
 * Collects all pull requests and sends only required data for each pull request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getPRdetails = async (req, res) => {
  try {
    const { data } = await githubService.fetchPRsByUser(req.params.id)

    if (data.total_count) {
      const allPRs = []
      data.items.forEach(({ title, html_url: htmlUrl, state, created_at: createdAt, updated_at: updatedAt, draft, labels, assignees }) => {
        const allAssignees = getNames(assignees, 'login')
        const allLabels = getNames(labels, 'name')
        allPRs.push({
          title,
          state,
          createdAt,
          updatedAt,
          url: htmlUrl,
          readyForReview: state === 'closed' ? false : !draft,
          labels: allLabels,
          assignees: allAssignees
        })
      })
      return res.json(allPRs)
    }
    return res.json([])
  } catch (err) {
    logger.error(`Error while processing pull requests: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  getPRdetails,
  getNames
}
