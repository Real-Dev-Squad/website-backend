
const { getUsername, getUserId } = require('./users')
const { fetchTask } = require('../models/tasks')
const logger = require('./logger')
const { getDocFromIds } = require('../utils/firestoreHelper')

const fromFirestoreData = async (story) => {
  try {
    if (!story) {
      return story
    }

    let { featureOwner, backendEngineer, frontendEngineer } = story

    const promises = [featureOwner, backendEngineer, frontendEngineer].map(async (userId) => {
      const username = await getUsername(userId)
      return username
    });
    [featureOwner, backendEngineer, frontendEngineer] = await Promise.all(promises)

    if (featureOwner) story.featureOwner = featureOwner
    if (backendEngineer) story.backendEngineer = backendEngineer
    if (frontendEngineer) story.frontendEngineer = frontendEngineer

    return {
      ...story
    }
  } catch (err) {
    logger.error('Error retrieving user data for story', err)
    throw err
  }
}

const toFirestoreData = async (story) => {
  try {
    if (!story) {
      return story
    }
    const updatedStory = { ...story }
    const { featureOwner, backendEngineer, frontendEngineer, tasks: taskIds } = story

    const usernames = [featureOwner, backendEngineer, frontendEngineer]
    const promises = usernames.map(async (username) => {
      if (!username) return null
      const userId = await getUserId(username)
      return userId
    })
    const userIds = await Promise.all(promises)
    if (userIds.includes(false)) return false

    if (featureOwner) updatedStory.featureOwner = userIds[0]
    if (backendEngineer) updatedStory.backendEngineer = userIds[1]
    if (frontendEngineer) updatedStory.frontendEngineer = userIds[2]

    if (Array.isArray(taskIds)) {
      const validTaskIds = []
      const tasksData = await getDocFromIds(taskIds, fetchTask)
      taskIds.forEach((taskId, index) => {
        if (tasksData[`${index}`].taskData) validTaskIds.push(taskId)
      })
      updatedStory.tasks = validTaskIds
    }
    return updatedStory
  } catch (err) {
    logger.error('Error retrieving user or task data for story', err)
    throw err
  }
}

module.exports = {
  fromFirestoreData,
  toFirestoreData
}
