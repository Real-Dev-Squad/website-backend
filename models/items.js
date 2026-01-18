const firestore = require("../utils/firestore");

const itemTagsModel = firestore.collection("itemTags");
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
    const hasItemTagsPromises = [];
    const isNewTag = {};
    for (const tag of tagPayload) {
      hasItemTagsPromises.push(
        itemTagsModel
          .where("itemId", "==", itemId)
          .where("tagId", "==", tag.tagId)
          .where("levelId", "==", tag.levelId)
          .get()
          .then((doc) => {
            isNewTag[tag.tagId] = doc.empty;
          })
      );
    }
    /**
     * In the above code, we are looping across every tag that is to be set and creating an Object that will
     * finally be used to check if atleast ONE of the tags is a new tag. Because if every tag is an existing
     * tag, it is unnecessary to proceed any further. The `isNewTag` Object will look like
     * {
     *    some_tag_id_1: false,
     *    some_tag_id_2: true
     * }
     * `some_tag_id_2:true` represent a new tag and false in the vice-versa.
     */

    await Promise.all(hasItemTagsPromises);
    const wasSuccess = Object.values(isNewTag).some((value) => value === true); // Atleast one new tag

    if (!wasSuccess) return { itemId, wasSuccess }; // Returns if none of the tags are new

    tagPayload.forEach((tag) => {
      if (isNewTag[tag.tagId]) {
        const itemTag = {
          itemId,
          itemType: itemType.toUpperCase(),
          tagId: tag.tagId,
          levelId: tag.levelId,
        };
        const docid = itemTagsModel.doc();
        batch.set(docid, itemTag);
      }
    });

    await batch.commit();
    return { itemId, wasSuccess };
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

    const addTagsAndLevelsData = [];
    for (const doc of data.docs) {
      const item = {
        id: doc.id,
        ...doc.data(),
      };
      addTagsAndLevelsData.push(
        tagsModel
          .doc(item.tagId)
          .get()
          .then((doc) => {
            item.tagName = doc.data().name;
            item.tagType = doc.data().type;
          })
      );
      addTagsAndLevelsData.push(
        levelsModel
          .doc(item.levelId)
          .get()
          .then((doc) => {
            item.levelName = doc.data().name;
            item.levelValue = doc.data().value;
          })
      );
      items.push(item);
    }
    /**
     * We are adding tags and levels actual to individual items as items object only has
     * primary keys i.e. `tagId` and `levelId`
     */
    await Promise.all(addTagsAndLevelsData);
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
