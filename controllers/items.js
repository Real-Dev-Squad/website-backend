const ItemTagsModel = require("../models/items");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Adds a tag to an item with its corresponding a level
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addTagsToItem = async (req, res) => {
  try {
    const { itemId } = await ItemTagsModel.addTagsToItem(req.body);
    return res.json({
      message: "Tags added successfully!",
      itemId,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    const { itemId, tagId } = await ItemTagsModel.removeTagsFromItem(req.body);
    return res.json({
      message: "Tags removed successfully!",
      itemId,
      tagId,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    if (!Object.keys(req.query).length) {
      return res.boom.badRequest("filter for item not provided");
    }
    const items = await ItemTagsModel.getItemBasedOnFilter(req.query);
    return res.json({
      message: "Items fetched Successfully",
      data: items,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  addTagsToItem,
  removeTagsFromItem,
  getItemBasedOnFilter,
};
