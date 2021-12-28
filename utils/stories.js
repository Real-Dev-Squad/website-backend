
const { getUsername, getUserId } = require('./users')

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
  const { featureOwner, backendEngineer, frontendEngineer } = story

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

module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildStories
}
