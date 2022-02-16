const firestore = require('../utils/firestore')
const storiesModel = firestore.collection('stories')
const { fromFirestoreData, toFirestoreData } = require('../utils/stories')
const { snapshotToArray } = require('../utils/firestoreHelper')

/**
 * Adds and Updates stories
 *
 * @param storyData { Object }: story data object to be stored in DB
 * @param storyId { string }: storyId which will be used to update the story in DB
 * @return {Promise<{storyId: string}>}
 */
const addOrUpdateStory = async (storyData, storyId = null) => {
  try {
    storyData = await toFirestoreData(storyData)
    if (storyData) {
      // storyId exists Update story
      if (storyId) {
        const story = await storiesModel.doc(storyId).get()
        await storiesModel.doc(storyId).set({
          ...story.data(),
          ...storyData
        })
        return { storyId }
      }
      const storyInfo = await storiesModel.add(storyData)
      const result = {
        storyId: storyInfo.id,
        storyDetails: await fromFirestoreData(storyData)
      }
      return result
    }
    return false
  } catch (err) {
    logger.error('Error in adding or updating story', err)
    throw err
  }
}

/**
 * Fetch all stories
 *
 * @return {Promise<stories|Array>}
 */
const fetchStories = async ({ page = {} }) => {
  try {
    const { offset = 0, limit = 10 } = page

    let query = {}
    query = storiesModel
      .limit(parseInt(limit))
      .offset(parseInt(offset))

    const storiesSnapshot = await query.get()
    const stories = snapshotToArray(storiesSnapshot)
    const promises = stories.map(async (story) => fromFirestoreData(story))
    const updatedStories = await Promise.all(promises)
    return updatedStories
  } catch (err) {
    logger.error('Error getting stories', err)
    throw err
  }
}

/**
 * Fetch a story
 * @param storyId { string }: storyId which will be used to fetch the story
 * @return {Promise<storyData|Object>}
 */
const fetchStory = async (storyId) => {
  try {
    const story = await storiesModel.doc(storyId).get()
    const storyData = story.data()
    return { storyData: await fromFirestoreData(storyData) }
  } catch (err) {
    logger.error('Error retrieving story data', err)
    throw err
  }
}

module.exports = {
  addOrUpdateStory,
  fetchStory,
  fetchStories
}
