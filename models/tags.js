const firestore = require("../utils/firestore");
const tagModel = firestore.collection("tags");

/**
 *
 * @param tagData { Object }: Data of the tag
 * @returns {Promise<tagModel|Object>}
 */

const addTag = async (tagData) => {
  try {
    tagData.type = tagData.type.toUpperCase().trim();
    tagData.name = tagData.name.toUpperCase().trim();

    const alreadyIsTag = await tagModel.where("name", "==", tagData.name).limit(1).get();
    if (!alreadyIsTag.empty) {
      const oldTag = [];
      alreadyIsTag.forEach((tag) => oldTag.push(tag.data()));
      return { tagData: oldTag, message: "Tag already exists!" };
    }

    const { id } = await tagModel.add(tagData);
    return { id, tagData, message: "Tag created successfully!" };
  } catch (err) {
    logger.error("Error in creating Tag", err);
    throw err;
  }
};

/**
 *
 * @param tagid { String }: tagid of the tag
 * @returns {Promise<tagModel|string>}: returns id of the deleted tag
 */

const deleteTag = async (tagid) => {
  try {
    await tagModel.doc(tagid).delete();
    return { tagid };
  } catch (err) {
    logger.error("Error in deleting Tag", err);
    throw err;
  }
};

/**
 *
 * @returns {Promise<tagModel|Array>}: returns an array of all the tags with its meta data
 */

const getAllTags = async () => {
  try {
    const data = await tagModel.get();
    const allTags = [];
    data.forEach((doc) => {
      const tag = {
        id: doc.id,
        ...doc.data(),
      };
      allTags.push(tag);
    });
    return { allTags };
  } catch (err) {
    logger.error("error getting tags", err);
    throw err;
  }
};

const getTagByType = async (type) => {
  try {
    const data = await tagModel.where("type", "==", type).get();
    const tags = [];
    data.forEach((doc) => {
      const tag = {
        id: doc.id,
        ...doc.data(),
      };
      tags.push(tag);
    });

    return { tags };
  } catch (err) {
    logger.error("error getting tags", err);
    throw err;
  }
};

module.exports = {
  addTag,
  deleteTag,
  getAllTags,
  getTagByType,
};
