// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'githubServ... Remove this comment to see the full error message
const githubService = require('../services/githubService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'tasks'.
const tasks = require('../models/tasks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUser'... Remove this comment to see the full error message
const { fetchUser } = require('../models/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userUtils'... Remove this comment to see the full error message
const userUtils = require('../utils/users')
/**
 * Get the contributions of the user
 * @param {string} username
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getUserCon... Remove this comment to see the full error message
const getUserContributions = async (username: any) => {
  const contributions = {}
  const { data } = await githubService.fetchPRsByUser(username)
  const allUserTasks = await tasks.fetchUserTasks(username)
  const noteworthy = []
  const all = []

  if (data.total_count) {
    const allPRsDetails = extractPRdetails(data)

    const participantsDetailsMap = new Map()
    const prMaps = new Map()

    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'pr' implicitly has an 'any' type.
    allPRsDetails.forEach(pr => {
      prMaps.set(pr.url, pr)
    })

    for (const task of allUserTasks) {
      const noteworthyObject = {}
      const participantsDetails = []

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'task' does not exist on type '{}'.
      noteworthyObject.task = extractTaskdetails(task)

      if (Array.isArray(task.participants)) {
        for (const userId of task.participants) {
          const username = await userUtils.getUsername(userId)
          const userDetails = participantsDetailsMap.get(username)
          if (userDetails) {
            participantsDetails.push(userDetails)
          } else {
            const user = await getUserDetails(username)
            participantsDetailsMap.set(username, user)
            participantsDetails.push(user)
          }
        }
      }

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'task' does not exist on type '{}'.
      noteworthyObject.task.participants = participantsDetails
      const prList: any = []

      task.links.forEach((link: any) => {
        const prObject = prMaps.get(link)
        if (prObject) {
          prList.push(prObject)
          prMaps.delete(link)
        }
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'prList' does not exist on type '{}'.
      noteworthyObject.prList = prList

      if (task.isNoteworthy) {
        noteworthy.push(noteworthyObject)
      } else {
        all.push(noteworthyObject)
      }
    }

    // @ts-expect-error ts-migrate(2569) FIXME: Type 'IterableIterator<any>' is not an array type ... Remove this comment to see the full error message
    for (const prDetails of prMaps.values()) {
      const allObject = {
        prList: [prDetails],
        task: {}
      }
      all.push(allObject)
    }
  }
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'noteworthy' does not exist on type '{}'.
  contributions.noteworthy = noteworthy
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'all' does not exist on type '{}'.
  contributions.all = all
  return contributions
}

/**
 * Extracts only the necessary details required from the object returned by Github API
 * @param data {Object} - Object returned by Github API
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'extractPRd... Remove this comment to see the full error message
const extractPRdetails = (data: any) => {
  const allPRs: any = []
  data.items.forEach(({
    title,
    user,
    html_url: url,
    state,
    created_at: createdAt,
    updated_at: updatedAt
  }: any) => {
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

const extractTaskdetails = (data: any) => {
  const { title, purpose, endsOn, startedOn, dependsOn, status, participants, featureUrl, isNoteworthy } = data
  return {
    title,
    purpose,
    endsOn,
    startedOn,
    dependsOn,
    status,
    participants,
    featureUrl,
    isNoteworthy
  }
}

/**
 * Get the user details
 * @param username {string}
 */

const getUserDetails = async (username: any) => {
  const { user } = await fetchUser({ username })
  const userDetails = extractUserDetails(user)
  return userDetails
}

/**
 * Extracts only the necessary details required from the object returned by user API
 * @param data {Object} - Object returned by User api
 */

const extractUserDetails = (data: any) => {
  const { username, firstname, lastname, img } = data
  if (!data.incompleteUserDetails) {
    return {
      firstname,
      lastname,
      img,
      username
    }
  } else {
    return { username }
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  getUserContributions
}
