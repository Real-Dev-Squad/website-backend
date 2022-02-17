const firestore = require("../utils/firestore");
const storiesModel = firestore.collection("stories");
const userUtils = require("../utils/users");
const { fromFirestoreData, toFirestoreData } = require("../utils/stories");
const { snapshotToArray } = require("../utils/firestoreHelper");
const { storyStatusEnum } = require("../constants/stories");

/**
 * Adds and Updates stories
 *
 * @param storyData { Object }: story data object to be stored in DB
 * @param storyId { string }: storyId which will be used to update the story in DB
 * @return {Promise<{storyId: string}>}
 */
const addOrUpdateStory = async (storyData, storyId = null) => {
  try {
    storyData = await toFirestoreData(storyData);
    if (storyData) {
      // storyId exists Update story
      if (storyId) {
        const story = await storiesModel.doc(storyId).get();
        await storiesModel.doc(storyId).set({
          ...story.data(),
          ...storyData,
        });
        return { storyId };
      }
      const storyInfo = await storiesModel.add(storyData);
      const result = {
        storyId: storyInfo.id,
        storyDetails: await fromFirestoreData(storyData),
      };
      return result;
    }
    return false;
  } catch (err) {
    logger.error("Error in adding or updating story", err);
    throw err;
  }
};

/**
 * Fetch all stories
 *
 * @return {Promise<stories|Array>}
 */
const fetchStories = async ({ page = {}, filter, sort }) => {
  try {
    const { offset = 0, limit = 100 } = page;

    let query = storiesModel;
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    if (filter) {
      for (let [fieldName, fieldValue] of Object.entries(filter)) {
        if (Array.isArray(fieldValue)) return false;

        if (["featureOwner", "backendEngineer", "frontendEngineer"].includes(fieldName)) {
          const userId = await userUtils.getUserId(fieldValue);
          if (!userId) return false;
          fieldValue = userId;
        } else if (fieldName === "status") {
          if (!storyStatusEnum.includes(fieldValue)) return false;
        } else {
          return false;
        }
        query = query.where(fieldName, "==", fieldValue);
      }
    }

    if (sort) {
      const sortByFields = sort?.split(",");
      const validFields = ["startedOn", "endsOn"];
      const isFieldValid = (fieldName) => {
        fieldName = fieldName.startsWith("-") ? fieldName.substring(1) : fieldName;
        return validFields.includes(fieldName);
      };
      if (sortByFields?.length > 0) {
        for (const fieldName of sortByFields) {
          if (!isFieldValid(fieldName)) {
            return false;
          }
          if (fieldName.startsWith("-")) {
            query = query.orderBy(fieldName.substring(1), "desc");
          } else {
            query = query.orderBy(fieldName);
          }
        }
      }
    }
    const storiesSnapshot = await query.get();
    const stories = snapshotToArray(storiesSnapshot);
    const promises = stories.map(async (story) => fromFirestoreData(story));
    const updatedStories = await Promise.all(promises);
    return updatedStories;
  } catch (err) {
    logger.error("Error getting stories", err);
    throw err;
  }
};

/**
 * Fetch a story
 * @param storyId { string }: storyId which will be used to fetch the story
 * @return {Promise<storyData|Object>}
 */
const fetchStory = async (storyId) => {
  try {
    const story = await storiesModel.doc(storyId).get();
    const storyData = story.data();
    return { storyData: await fromFirestoreData(storyData) };
  } catch (err) {
    logger.error("Error retrieving story data", err);
    throw err;
  }
};

module.exports = {
  addOrUpdateStory,
  fetchStory,
  fetchStories,
};
