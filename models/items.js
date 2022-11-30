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
 * @param filter { Object }: filter for the tag
 * @returns {Promise<tagModel|Array>}
 */

const getItemBasedOnFilter = async (filter) => {
  try {
    const filterKey = Object.keys(filter)[0];
    const data = await itemModel.where(filterKey, "==", filter[filterKey]).get();
    const items = [];

    data.forEach((doc) => {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      items.push(item);
    });

    return items;
  } catch (err) {
    logger.error("Error in getting Item based on filter", err);
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
  getAllItems,
  getItemBasedOnFilter,
};
