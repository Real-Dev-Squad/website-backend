const firestore = require("../utils/firestore");

const itemModel = firestore.collection("items");
const tagModel = firestore.collection("tags");
const levelModel = firestore.collection("levels");

/**
 *
 * @param itemData { Object }: Data of the item, item type and Array of pairs of tagid and levelid
 * @returns {Promise<tagModel|String>}
 */

const addTagsToItem = async (itemData) => {
  try {
    const { itemId, itemType, tagPayload } = itemData;
    const batch = firestore.batch();
    for (const tag of tagPayload) {
      const tagData = await tagModel.doc(tag.tagId).get();
      const levelData = await levelModel.doc(tag.levelId).get();
      const itemTag = {
        itemId,
        itemType: itemType.toUpperCase(),
        tagId: tag.tagId,
        tagName: tagData.data().name,
        tagType: tagData.data().type,
        levelId: tag.levelId,
        levelName: levelData.data().name,
        levelNumber: levelData.data().levelNumber,
      };
      const docid = itemModel.doc();
      batch.set(docid, itemTag);
    }
    await batch.commit();
    return { itemId };
  } catch (err) {
    logger.error("Error in creating Item", err);
    throw err;
  }
};

/**
 *
 * @param itemData { Object }: itemid and tagid of the tag to be removed from the item
 * @returns {Promise<tagModel|Object>}
 */

const removeTagsFromItem = async (itemData) => {
  try {
    const { itemId, tagId } = itemData;
    const query = itemModel.where("tagId", "==", tagId).where("itemId", "==", itemId);
    query.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        doc.ref.delete();
      });
    });
    return { itemId, tagId };
  } catch (err) {
    logger.error("Error in deleting Item", err);
    throw err;
  }
};

/**
 *
 * @param itemType { String }: type of the item
 * @returns {Promise<tagModel|Array>}
 */

const getItemsBasedOnType = async (itemType) => {
  try {
    const data = await itemModel.where("itemType", "==", itemType.toUpperCase()).get();
    const itemsWithType = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      itemsWithType.push(item);
    });
    return itemsWithType;
  } catch (err) {
    logger.error("Error in getting Item based on item type", err);
    throw err;
  }
};

/**
 *
 * @param tagId { String }: tagid of the tag
 * @returns {Promise<tagModel|Array>}
 */

const getItemsBasedOnTagId = async (tagId) => {
  try {
    const data = await itemModel.where("tagId", "==", tagId).get();
    const itemsWithTag = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      itemsWithTag.push(item);
    });
    return itemsWithTag;
  } catch (err) {
    logger.error("Error in getting Item based on tag id", err);
    throw err;
  }
};

/**
 *
 * @param itemId { String }: itemid of the item
 * @returns {Promise<tagModel|Array>}
 */

const getItemsBasedOnItemId = async (itemId) => {
  try {
    const data = await itemModel.where("itemId", "==", itemId).get();
    const itemsWithItemId = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      itemsWithItemId.push(item);
    });
    return itemsWithItemId;
  } catch (err) {
    logger.error("Error in getting Item based on item id", err);
    throw err;
  }
};

/**
 *
 * @param tagType { String }: type of the tag
 * @returns {Promise<tagModel|Object>}
 */

const getItemsBasedOnTagType = async (tagType) => {
  try {
    const data = await itemModel.where("tagType", "==", tagType.toUpperCase()).get();
    const itemsWithItemId = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      itemsWithItemId.push(item);
    });
    return itemsWithItemId;
  } catch (err) {
    logger.error("Error in getting Item based on tag type", err);
    throw err;
  }
};

/**
 *
 * @returns {Promise<tagModel|Array>}
 */

const getAllItems = async () => {
  try {
    const data = await itemModel.get();
    const allItems = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      allItems.push(item);
    });
    return allItems;
  } catch (err) {
    logger.error("Error in getting Items", err);
    throw err;
  }
};

module.exports = {
  addTagsToItem,
  removeTagsFromItem,
  getItemsBasedOnType,
  getItemsBasedOnTagId,
  getItemsBasedOnItemId,
  getItemsBasedOnTagType,
  getAllItems,
};
