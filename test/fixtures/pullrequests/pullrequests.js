const githubPRInfo = require('../contributions/githubPRInfo')()

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

module.exports = { getOpenPRs, getStalePRs }
