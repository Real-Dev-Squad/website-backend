const admin = require("firebase-admin");

import { Question, QuestionBody } from "../types/questions";
import { logger } from "../utils/logger";

const firestore = require("../utils/firestore");

const questionModel = firestore.collection("questions");

const createQuestion = async (questionData: QuestionBody): Promise<Question> => {
  try {
    const { eventId: event_id, createdBy: created_by, question, maxCharacters: max_characters } = questionData;
    const questionRef = questionModel.doc(questionData.id);
    const createdAndUpdatedAt = admin.firestore.Timestamp.now();

    await questionRef.set({
      question,
      event_id,
      created_by,
      max_characters: max_characters || null,
      created_at: createdAndUpdatedAt,
      updated_at: createdAndUpdatedAt,
    });
    const questionSnapshot = await questionRef.get();
    const id = questionSnapshot.id;
    const questionFromDB = questionSnapshot.data();

    return { id, ...questionFromDB };
  } catch (error) {
    logger.error(`Some error occured while creating question ${error}`);
    throw error;
  }
};

module.exports = { createQuestion };
