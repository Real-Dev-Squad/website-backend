const stories = require('../models/stories')
/**
 * Creates new story
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Story object
 * @param res {Object} - Express response object
 */
const addNewStory = async (req, res) => {
  try {
    const story = await stories.addOrUpdateStory(req.body)

    if (story) {
      return res.json({
        message: 'Story created successfully!',
        story: story.storyDetails,
        id: story.storyId
      })
    } else {
      logger.error('Error while creating new story: Incorrect username passed')
      return res.boom.badRequest('Unable to add story')
    }
  } catch (err) {
    logger.error(`Error while creating new story: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}
/**
 * Fetches all the stories
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchStories = async (req, res) => {
  try {
    const allStories = await stories.fetchStories()
    return res.json({
      message: 'Stories returned successfully!',
      stories: allStories.length > 0 ? allStories : []
    })
  } catch (err) {
    logger.error(`Error while fetching stories ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

const fetchStory = async (req, res) => {
  try {
    const story = await stories.fetchStory(req.params.id)
    if (!story.storyData) {
      return res.boom.notFound('Story not found')
    }
    return res.json({
      message: 'Story returned successfully!',
      story: story.storyData
    })
  } catch (err) {
    logger.error(`Error while fetching story ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

/**
 * Updates the story
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateStory = async (req, res) => {
  try {
    const story = await stories.fetchStory(req.params.id)
    if (!story.storyData) {
      return res.boom.notFound('Story not found')
    }

    const updateStoryResult = await stories.addOrUpdateStory(req.body, req.params.id)
    if (updateStoryResult) {
      return res.status(204).send()
    } else {
      logger.error(`Error while updating storyId ${req.params.id}: Incorrect username passed`)
      return res.boom.badRequest('Unable to update story')
    }
  } catch (err) {
    logger.error(`Error while updating story: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  addNewStory,
  fetchStories,
  fetchStory,
  updateStory
}
