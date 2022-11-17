const TagModel = require("../models/tags");
const admin = require("firebase-admin");

/**
 * Creates a new tag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addTag = async (req, res) => {
  try {
    const { id, tagData } = await TagModel.addTag({
      ...req.body,
      createdby: req.userData.id,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    });
    return id
      ? res.json({
          message: "Tag created successfully!",
          data: tagData,
          id,
        })
      : res.status(400).json({
          message: "Tag already exists!",
          data: tagData,
          id,
        });
  } catch (err) {
    logger.error(`Error while creating new tag: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
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
    return res.boom.badImplementation("An internal server error occurred");
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
      allTags,
    });
  } catch (err) {
    logger.error(`Error while fetching all the tag: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const getTagsByType = async (req, res) => {
  try {
    const type = req.params.type.toUpperCase();
    const { tags } = await TagModel.getTagByType(type);
    return res.json({
      tags,
    });
  } catch (err) {
    logger.error(`Error while fetching the tags: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  addTag,
  deleteTag,
  getAllTags,
  getTagsByType,
};
