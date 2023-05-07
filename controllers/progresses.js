const { createProgressDocument, getProgressDocument } = require("../models/progresses");

/**
 * Add Progresses Document
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createProgress = async (req, res) => {
  try {
    const data = await createProgressDocument({ ...req.body, userId: req.userData.id });
    return res.json({
      data,
      message: `${
        req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1)
      } Progress document created successfully.`,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

/**
 * Add Progresses Document
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getProgress = async (req, res) => {
  const data = await getProgressDocument(req.body);
  const count = data.length;
  return res.json({
    message: count ? `Progress document retrieved successfully.` : `No Progress document found.`,
    count,
    data,
  });
};

module.exports = { createProgress, getProgress };
