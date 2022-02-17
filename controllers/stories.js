const stories = require("../models/stories");
/**
 * Creates new story
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Story object
 * @param res {Object} - Express response object
 */
const addNewStory = async (req, res) => {
  try {
    const story = await stories.addOrUpdateStory(req.body);

    if (story) {
      return res.json({
        message: "Story created successfully!",
        story: story.storyDetails,
        id: story.storyId,
      });
    } else {
      logger.error("Error while creating new story: Incorrect username passed");
      return res.boom.badRequest("Unable to add story");
    }
  } catch (err) {
    logger.error(`Error while creating new story: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};
/**
 * Fetches all the stories
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchStories = async (req, res) => {
  try {
    const result = {};
    if (req.params.id) {
      const story = await stories.fetchStory(req.params.id);
      if (!story.storyData) {
        return res.boom.notFound("Story not found");
      }
      result.message = "Story returned successfully!";
      result.story = story.storyData;
    } else {
      const allStories = await stories.fetchStories(req.query);
      if (!allStories) {
        logger.error("Error while fetching story: Incorrect query parameters");
        return res.boom.badRequest("Unable to fetch stories");
      }
      result.message = "Stories returned successfully!";
      result.stories = allStories.length > 0 ? allStories : [];
    }
    return res.json({ ...result });
  } catch (err) {
    logger.error(`Error while fetching stories ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Updates the story
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateStory = async (req, res) => {
  try {
    const story = await stories.fetchStory(req.params.id);
    if (!story.storyData) {
      return res.boom.notFound("Story not found");
    }

    const updateStoryResult = await stories.addOrUpdateStory(req.body, req.params.id);
    if (updateStoryResult) {
      return res.status(204).send();
    } else {
      logger.error(`Error while updating storyId ${req.params.id}: Incorrect username passed`);
      return res.boom.badRequest("Unable to update story");
    }
  } catch (err) {
    logger.error(`Error while updating story: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  addNewStory,
  fetchStories,
  updateStory,
};
