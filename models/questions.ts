import admin from "firebase-admin";
import { Question, QuestionBody } from "../types/questions";
import firestore from "../utils/firestore.js";
import logger from "../utils/logger.js";

const questionModel = firestore.collection("questions");

const createQuestion = async (inputData: QuestionBody): Promise<Question> => {
  try {
    const { eventId: event_id, createdBy: created_by, question, maxCharacters } = inputData;
    const questionRef = questionModel.doc(inputData.id);
    const createdAndUpdatedAt = admin.firestore.Timestamp.now();

    const questionData: Omit<Question, 'id'> = {
      question,
      event_id,
      created_by,
      max_characters: maxCharacters ? String(maxCharacters) : null,
      created_at: createdAndUpdatedAt,
    };

    await questionRef.set(questionData);
    const questionSnapshot = await questionRef.get();
    const id = questionSnapshot.id;

    return { id, ...questionData };
  } catch (error) {
    logger.error(`Some error occured while creating question ${error}`);
    throw error;
  }
};

export { createQuestion };
