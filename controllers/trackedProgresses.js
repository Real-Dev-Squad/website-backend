const { Conflict, NotFound } = require("http-errors");
const { INTERNAL_SERVER_ERROR_MESSAGE } = require("../constants/progresses");
const { createTrackedProgressDocument, updateTrackedProgressDocument } = require("../models/trackedProgresses");

const createTrackedProgressController = async (req, res) => {
  try {
    const data = await createTrackedProgressDocument({ ...req.body });
    return res.status(201).json({
      data,
      message: "tracked progress document created successfully.",
    });
  } catch (error) {
    if (error instanceof Conflict) {
      return res.status(409).json({
        message: error.message,
      });
    } else if (error instanceof NotFound) {
      return res.status(404).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

const updateTrackedProgressController = async (req, res) => {
  try {
    const data = await updateTrackedProgressDocument({ ...req });
    return res.status(200).json({
      data,
      message: "tracked progress document updated successfully.",
    });
  } catch (error) {
    if (error instanceof NotFound) {
      return res.status(404).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

module.exports = { createTrackedProgressController, updateTrackedProgressController };
