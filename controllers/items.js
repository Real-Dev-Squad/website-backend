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
 * Collects and returns items based on a particular item type
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getItemsBasedOnType = async (req, res) => {
  try {
    const items = await ItemModel.getItemsBasedOnType(req.params.type);
    return res.json({
      message: "Items fetched Successfully",
      data: items,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Collects and returns items based on a particular tag id
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getItemsBasedOnTagId = async (req, res) => {
  try {
    const items = await ItemModel.getItemsBasedOnTagId(req.params.tagId);
    return res.json({
      message: "Items fetched Successfully",
      data: items,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Collects and returns items with its tags and levels data based on a particular itemid
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getItemsBasedOnitemId = async (req, res) => {
  try {
    const items = await ItemModel.getItemsBasedOnItemId(req.params.itemId);
    return res.json({
      message: "Item fetched Successfully",
      data: items,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Collects and returns items based on a particular tag type
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getItemsBasedOnTagType = async (req, res) => {
  try {
    const items = await ItemModel.getItemsBasedOnTagType(req.params.tagType);
    return res.json({
      message: "Item fetched Successfully",
      data: items,
    });
  } catch (err) {
    logger.error(`Error while creating new item: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Collects and returns all items with some tag and level
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getAllItems = async (req, res) => {
  try {
    const allItems = await ItemModel.getAllItems();
    return res.json({
      allItems,
    });
  } catch (err) {
    logger.error(`Error while creating new Level: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  addTagsToItem,
  removeTagsFromItem,
  getItemsBasedOnType,
  getItemsBasedOnTagId,
  getItemsBasedOnitemId,
  getItemsBasedOnTagType,
  getAllItems,
};
