
const { getUsername, getUserId } = require('./users')
const { fetchTask } = require('../models/tasks')

const fromFirestoreData = async (story) => {
  if (!story) {
    return story
  }

  let { featureOwner, backendEngineer, frontendEngineer } = story

  if (featureOwner) {
    featureOwner = await getUsername(featureOwner)
  }

  if (backendEngineer) {
    backendEngineer = await getUsername(backendEngineer)
  }

  if (frontendEngineer) {
    frontendEngineer = await getUsername(frontendEngineer)
  }

  return {
    ...story,
    featureOwner,
    backendEngineer,
    frontendEngineer
  }
}

const toFirestoreData = async (story) => {
  if (!story) {
    return story
  }
  const updatedStory = { ...story }
  const { featureOwner, backendEngineer, frontendEngineer, tasks } = story

  if (featureOwner) {
    updatedStory.featureOwner = await getUserId(featureOwner)
    if (!updatedStory.featureOwner) return false
  }

  if (backendEngineer) {
    updatedStory.backendEngineer = await getUserId(backendEngineer)
    if (!updatedStory.backendEngineer) return false
  }

  if (frontendEngineer) {
    updatedStory.frontendEngineer = await getUserId(frontendEngineer)
    if (!updatedStory.frontendEngineer) return false
  }

  if (Array.isArray(tasks)) {
    updatedStory.tasks = await getValidTaskIds(tasks)
  }

  return updatedStory
}

const buildStories = (stories, initialStoryArray = []) => {
  if (!stories.empty) {
    stories.forEach((story) => {
      initialStoryArray.push({
        id: story.id,
        ...story.data()
      })
    })
  }

  return initialStoryArray
}

const getValidTaskIds = async (taskArray) => {
  try {
    if (!Array.isArray(taskArray)) {
      return []
    }
    const promises = taskArray.map(async (taskId) => {
      const task = await fetchTask(taskId)
      return task.taskData ? taskId : false
    })
    let taskIdArray = await Promise.all(promises)
    taskIdArray = taskIdArray.filter(Boolean)
    return taskIdArray
  } catch (err) {
    logger.error('Error in updating the story object', err)
    throw err
  }
}

module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildStories
}
