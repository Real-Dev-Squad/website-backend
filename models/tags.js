const firestore = require("../utils/firestore");
const tagModel = firestore.collection("tags");

/**
 *
 * @param tagData { Object }: Data of the tag
 * @returns {Promise<tagModel|Object>}
 */

const addTag = async (tagData) => {
  try {
    tagData.type = tagData.type.toUpperCase();
    tagData.name = tagData.name.toUpperCase();
    const { id } = await tagModel.add(tagData);
    return { id, tagData };
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
  const data = await tagModel.get();
  const allTags = [];
  data.forEach((doc) => {
    const tag = {
      id: doc.id,
      name: doc.data().name,
      type: doc.data().type,
      createdby: doc.data().createdby,
      date: doc.data().date,
      reason: doc.data().reason,
    };
    allTags.push(tag);
  });
  return { allTags };
};

const getTagByType = async (type) => {
  try {
    const data = await tagModel.where("type", "==", type).get();
    const tags = [];
    data.forEach((doc) => {
      const tag = {
        id: doc.id,
        name: doc.data().name,
        type: doc.data().type,
        createdby: doc.data().createdby,
        date: doc.data().date,
        reason: doc.data().reason,
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
