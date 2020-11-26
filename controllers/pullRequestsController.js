const logger = require('../utils/logger')
const fetch = require('../lib/fetch')
const getGithubId = require('../utils/getGithubId')

const pullRequests = async (req, res) => {
  try {
    const githubId = await getGithubId(req.params.id)
    const url = `https://api.github.com/search/issues?q=org:Real-Dev-Squad+author:${githubId}+type:pr`
    const { data } = await fetch(url)
    const allPRs = []
    if (data.total_count) {
      data.items.forEach((res) => {
        allPRs.push({
          title: res.title,
          url: res.url,
          state: res.state,
          created_at: res.created_at,
          updated_at: res.updated_at,
          ready_for_review: res.state === 'closed' ? false : !res.draft,
          labels: res.labels,
          assignees: res.assignees
        })
      })
      return res.send(allPRs)
    }
    return res.send('No pull requests found!')
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  pullRequests
}
