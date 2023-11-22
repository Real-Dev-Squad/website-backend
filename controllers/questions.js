const logger = require("../utils/logger.ts");
const crypto = require("crypto");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const questionQuery = require("../models/questions");

const createQuestion = async (req, res) => {
  try {
    const questionId = crypto.randomUUID({ disableEntropyCache: true });
    const question = await questionQuery.createQuestion({ ...req.body, id: questionId });
    return res.status(201).json({
      message: "Question created successfully!",
      data: question,
    });
  } catch (error) {
    logger.error(`Error while creating question: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = { createQuestion };
