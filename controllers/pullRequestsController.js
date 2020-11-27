const logger = require('../utils/logger')
const fetch = require('../lib/fetch')
// const getGithubId = require('../utils/getGithubId')
const { fetchUser } = require('../models/users')

const pullRequests = async (req, res) => {
  try {
    const BASE_URL = 'https://api.github.com'
    const { user } = await fetchUser(req.params.id)
    const url = `${BASE_URL}/search/issues?q=org:Real-Dev-Squad+author:${user.github_id}+type:pr`
    const { data } = await fetch(url)

    const getNames = (arrayOfObjects, key) => {
      const names = []
      arrayOfObjects.forEach((object) => {
        names.push(object[key])
      })
      return names
    }
    if (data.total_count) {
      const allPRs = []
      data.items.forEach(({ title, html_url: htmlUrl, state, created_at: createdAt, updated_at: updatedAt, draft, labels, assignees }) => {
        const allAssignees = getNames(assignees, 'login')
        const allLabels = getNames(labels, 'name')
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
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  pullRequests
}
