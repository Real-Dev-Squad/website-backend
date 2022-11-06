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
    const { itemid, itemType, tagPayload } = itemData;
    const batch = await firestore.batch();
    for (const tag of tagPayload) {
      const tagData = await tagModel.doc(tag[0]).get();
      const levelData = await levelModel.doc(tag[1]).get();
      const itemTag = {
        itemid,
        itemtype: itemType.toUpperCase(),
        tagid: tag[0],
        tagname: tagData.data().name,
        tagtype: tagData.data().type,
        levelid: tag[1],
        levelname: levelData.data().name,
      };
      const docid = itemModel.doc();
      batch.set(docid, itemTag);
    }
    await batch.commit();
    return { itemid };
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
    const { itemid, tagid } = itemData;
    const query = itemModel.where("tagid", "==", tagid).where("itemid", "==", itemid);
    query.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        doc.ref.delete();
      });
    });
    return { itemid, tagid };
  } catch (err) {
    logger.error("Error in deleting Item", err);
    throw err;
  }
};

/**
 *
 * @param itemtype { String }: type of the item
 * @returns {Promise<tagModel|Array>}
 */

const getItemsBasedOnType = async (itemtype) => {
  try {
    const data = await itemModel.where("itemType", "==", itemtype.toUpperCase()).get();
    const itemsWithType = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        itemtype: itemtype.toUpperCase(),
        itemid: doc.data().itemid,
        tagid: doc.data().tagid,
        tagname: doc.data().tagname,
        levelid: doc.data().levelid,
        tagtype: doc.data().tagtype,
        levelname: doc.data().levelname,
      };
      itemsWithType.push(item);
    });
    return itemsWithType;
  } catch (err) {
    logger.error("Error in deleting Item", err);
    throw err;
  }
};

/**
 *
 * @param tagid { String }: tagid of the tag
 * @returns {Promise<tagModel|Array>}
 */

const getItemsBasedOnTagId = async (tagid) => {
  try {
    const data = await itemModel.where("tagid", "==", tagid).get();
    const itemsWithTag = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        itemid: doc.data().itemid,
        tagid,
        tagname: doc.data().tagname,
        levelid: doc.data().levelid,
        levelname: doc.data().levelname,
        tagtype: doc.data().tagtype,
        itemtype: doc.data().itemtype,
      };
      itemsWithTag.push(item);
    });
    return itemsWithTag;
  } catch (err) {
    logger.error("Error in deleting Item", err);
    throw err;
  }
};

/**
 *
 * @param itemid { String }: itemid of the item
 * @returns {Promise<tagModel|Array>}
 */

const getItemsBasedOnItemId = async (itemid) => {
  try {
    const data = await itemModel.where("itemid", "==", itemid).get();
    const itemsWithItemId = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        tagid: doc.data().tagid,
        itemid,
        tagname: doc.data().tagname,
        levelid: doc.data().levelid,
        tagtype: doc.data().tagtype,
        levelname: doc.data().levelname,
        itemtype: doc.data().itemtype,
      };
      itemsWithItemId.push(item);
    });
    return itemsWithItemId;
  } catch (err) {
    logger.error("Error in deleting Item", err);
    throw err;
  }
};

/**
 *
 * @param tagtype { String }: type of the tag
 * @returns {Promise<tagModel|Object>}
 */

const getItemsBasedOnTagType = async (tagtype) => {
  try {
    const data = await itemModel.where("tagtype", "==", tagtype.toUpperCase()).get();
    const itemsWithItemId = [];
    data.forEach((doc) => {
      const item = {
        id: doc.id,
        tagid: doc.data().tagid,
        itemid: doc.data().itemid,
        tagname: doc.data().tagname,
        tagtype: tagtype.toUpperCase(),
        levelid: doc.data().levelid,
        levelname: doc.data().levelname,
        itemtype: doc.data().itemtype,
      };
      itemsWithItemId.push(item);
    });
    return itemsWithItemId;
  } catch (err) {
    logger.error("Error in deleting Item", err);
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
        itemid: doc.data().itemid,
        tagid: doc.data().tagid,
        tagname: doc.data().tagname,
        itemType: doc.data().itemType,
        levelid: doc.data().levelid,
        levelname: doc.data().levelname,
        itemtype: doc.data().itemtype,
      };
      allItems.push(item);
    });
    return allItems;
  } catch (err) {
    logger.error("Error in deleting Item", err);
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
