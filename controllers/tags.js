const TagModel = require("../models/tags");
const admin = require("firebase-admin");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Creates a new tag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addTag = async (req, res) => {
  try {
    const { id, tagData, message } = await TagModel.addTag({
      ...req.body,
      createdBy: req.userData.id,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    });
    if (id) {
      return res.json({
        message,
        data: { tag: tagData, id },
      });
    } else {
      return res.status(400).json({
        message,
        data: { tag: tagData },
      });
    }
  } catch (err) {
    logger.error(`Error while creating new tag: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Deletes a tag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const deleteTag = async (req, res) => {
  try {
    const { id } = await TagModel.deleteTag(req.params.tagid);
    return res.json({
      message: "Tag Deleted successfully!",
      id,
    });
  } catch (err) {
    logger.error(`Error while deleting the tag: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Collects all tags
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getAllTags = async (req, res) => {
  try {
    const { allTags } = await TagModel.getAllTags();
    return res.json({
      message: "Tags returned successfully",
      tags: allTags,
    });
  } catch (err) {
    logger.error(`Error while fetching all the tag: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getTagsByType = async (req, res) => {
  try {
    const type = req.params.type.toUpperCase();
    const { tags } = await TagModel.getTagByType(type);
    return res.json({
      message: `Tags of type: ${type} returned successfully`,
      tags,
    });
  } catch (err) {
    logger.error(`Error while fetching the tags: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  addTag,
  deleteTag,
  getAllTags,
  getTagsByType,
};
