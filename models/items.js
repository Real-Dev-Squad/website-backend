const firestore = require("../utils/firestore");

const itemTagsModel = firestore.collection("items");
const tagsModel = firestore.collection("tags");
const levelsModel = firestore.collection("levels");

/**
 *
 * @param itemData { Object }: Data of the item, item type and Array of pairs of tagid and levelid
 * @returns {Promise<tagModel|String>}
 */

const addTagsToItem = async (itemData) => {
  try {
    const { itemId, itemType, tagPayload } = itemData;
    const batch = firestore.batch();
    let isNewtag = false;
    for (const tag of tagPayload) {
      const itemData = await itemTagsModel
        .where("itemId", "==", itemId)
        .where("tagId", "==", tag.tagId)
        .where("levelId", "==", tag.levelId)
        .get();
      if (!itemData.empty) continue;
      isNewtag = true;
      const itemTag = {
        itemId,
        itemType: itemType.toUpperCase(),
        tagId: tag.tagId,
        levelId: tag.levelId,
      };
      const docid = itemTagsModel.doc();
      batch.set(docid, itemTag);
    }
    await batch.commit();
    return { itemId, isNewtag };
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
    const query = itemTagsModel.where("tagId", "==", tagId).where("itemId", "==", itemId);
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

const getItemBasedOnFilter = async (query) => {
  try {
    let call = itemTagsModel;
    Object.keys(query).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      call = call.where(key, "==", query[key]);
    });
    const items = [];
    const data = await call.get();

    for (const doc of data.docs) {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      await tagsModel
        .doc(item.tagId)
        .get()
        .then((doc) => {
          item.tagName = doc.data().name;
          item.tagType = doc.data().type;
        });
      await levelsModel
        .doc(item.levelId)
        .get()
        .then((doc) => {
          item.levelName = doc.data().name;
          item.levelValue = doc.data().value;
        });
      items.push(item);
    }

    return items;
  } catch (err) {
    logger.error("Error in getting Item based on filter", err);
    throw err;
  }
};

module.exports = {
  addTagsToItem,
  removeTagsFromItem,
  getItemBasedOnFilter,
};
