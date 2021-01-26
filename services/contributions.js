const githubService = require('../services/githubService')
const tasks = require('../models/tasks')

/**
 * Get the  contributions of the user
 * @param {string} username
 */

const getUserContributions = async (username) => {
  const contributions = {}
  const { data } = await githubService.fetchPRsByUser(username)
  const allUserTasks = await tasks.fetchUserTasks(username)
  const noteworthy = []
  const all = []

  if (data.total_count) {
    const allPRsDetails = extractPRdetails(data)
    const prMaps = new Map()
    allPRsDetails.forEach(pr => {
      prMaps.set(pr.url, pr)
    })
    allUserTasks.forEach(task => {
      const noteworthyObject = {}
      noteworthyObject.task = extractTaskdetails(task)
      const prList = []
      task.links.forEach(link => {
        const prObject = prMaps.get(link)
        if (prObject) {
          prList.push(prObject)
          prMaps.delete(link)
        }
      })
      noteworthyObject.prList = prList

      if (task.isNoteworthy) {
        noteworthy.push(noteworthyObject)
      } else {
        all.push(noteworthyObject)
      }
    })
    for (const prDetails of prMaps.values()) {
      const allObject = {
        prList: prDetails,
        task: {}
      }
      all.push(allObject)
    }
  }
  contributions.noteworthy = noteworthy
  contributions.all = all
  return contributions
}

/**
 * Extracts only the necessary details required from the object returned by Github API
 * @param data {Object} - Object returned by Github API
 */

const extractPRdetails = (data) => {
  const allPRs = []
  data.items.forEach(({ title, user, html_url: url, state, created_at: createdAt, updated_at: updatedAt }) => {
    allPRs.push({
      title,
      state,
      createdAt,
      updatedAt,
      url,
      raisedBy: user.login
    })
  })
  return allPRs
}

/**
 * Extracts only the necessary details required from the object returned by Task API
 * @param data {Object} - Object returned by Task API
 */

const extractTaskdetails = (data) => {
  const { title, purpose, endsOn, startedOn, dependsOn, participants, featureUrl, isNoteworthy } = data
  return {
    title,
    purpose,
    endsOn,
    startedOn,
    dependsOn,
    participants,
    featureUrl,
    isNoteworthy
  }
}

module.exports = {
  getUserContributions
}
