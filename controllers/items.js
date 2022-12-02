const ItemModel = require("../models/items");

/**
 * Adds a tag to an item with its corresponding a level
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addTagsToItem = async (req, res) => {
  try {
    const { itemId } = await ItemModel.addTagsToItem(req.body);
    return res.json({
      message: "Tags added successfully!",
      itemId,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Removes a tag from an items
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const removeTagsFromItem = async (req, res) => {
  try {
    const { itemId, tagId } = await ItemModel.removeTagsFromItem(req.body);
    return res.json({
      message: "Tags removed successfully!",
      itemId,
      tagId,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * returns item based on filter
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getItemBasedOnFilter = async (req, res) => {
  try {
    const items = await ItemModel.getItemBasedOnFilter(req.query);
    return res.json({
      message: "Items fetched Successfully",
      data: items,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  addTagsToItem,
  removeTagsFromItem,
  getItemBasedOnFilter,
};
