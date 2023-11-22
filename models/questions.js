/* eslint-disable camelcase */
const admin = require("firebase-admin");
const firestore = require("../utils/firestore");
const logger = require("../utils/logger");

const questionModel = firestore.collection("questions");

const createQuestion = async (questionData) => {
  try {
    const { eventId: event_id, createdBy: created_by, question, maxWords: max_words } = questionData;
    const questionRef = questionModel.doc(questionData.id);
    const createdAndUpdatedAt = admin.firestore.Timestamp.now();

    await questionRef.set({
      question,
      event_id,
      created_by,
      max_words: max_words || null,
      is_new: true,
      created_at: createdAndUpdatedAt,
      updated_at: createdAndUpdatedAt,
    });

    const questionSnapshot = await questionRef.get();
    const questionFromDB = questionSnapshot.data();

    return questionFromDB;
  } catch (error) {
    logger.error(`Some error occured while creating question ${error}`);
    throw error;
  }
};

module.exports = { createQuestion };
