import admin from "firebase-admin";
import firestore from "../utils/firestore.js";
import { Answer, AnswerBody, AnswerFieldsToUpdate } from "../typeDefinitions/answers.js";
import { ANSWER_STATUS } from "../constants/answers.js";
import logger from "../utils/logger.js";

const answerModel = firestore.collection("answers");

const createAnswer = async (answerData: AnswerBody) => {
  try {
    const { eventId: event_id, answeredBy: answered_by, answer, questionId: question_id } = answerData;
    const answerRef = answerModel.doc(answerData.id);
    const createdAndUpdatedAt = admin.firestore.Timestamp.now();

    await answerRef.set({
      answer,
      event_id,
      answered_by,
      question_id,
      status: ANSWER_STATUS.PENDING,
      reviewed_by: null,
      created_at: createdAndUpdatedAt,
      updated_at: createdAndUpdatedAt,
    });
    const answerSnapshot = await answerRef.get();
    const id = answerSnapshot.id;
    const answerFromDB = answerSnapshot.data();

    return { id, ...answerFromDB };
  } catch (error) {
    logger.error(`Some error occured while creating answer ${error}`);
    throw error;
  }
};

const updateAnswer = async (id: string, fieldsToUpdate: AnswerFieldsToUpdate) => {
  try {
    const answerRef = answerModel.doc(id);
    const updatedAt = admin.firestore.Timestamp.now();
    await answerRef.update({ ...fieldsToUpdate, updated_at: updatedAt });

    const answerSnapshot = await answerRef.get();
    const answer = answerSnapshot.data();

    return { id: answerSnapshot.id, ...answer };
  } catch (error) {
    logger.error(`Some error occured while updating answer ${error}`);
    throw error;
  }
};

interface QueryFields {
  event_id?: string;
  answered_by?: string;
  question_id?: string;
  status?: string;
}

const getAnswers = async (queryFields: QueryFields): Promise<Answer[]> => {
  try {
    let query: admin.firestore.Query = answerModel;
    if (queryFields.event_id) {
      query = query.where("event_id", "==", queryFields.event_id);
    }
    if (queryFields.answered_by) {
      query = query.where("answered_by", "==", queryFields.answered_by);
    }
    if (queryFields.question_id) {
      query = query.where("question_id", "==", queryFields.question_id);
    }
    if (queryFields.status) {
      query = query.where("status", "==", queryFields.status);
    }
    const answersSnapshot = await query.get();
    const answers: Answer[] = [];
    answersSnapshot.forEach((doc) => {
      answers.push({ id: doc.id, ...doc.data() } as Answer);
    });
    return answers;
  } catch (error) {
    logger.error(`Some error occured while getting answers ${error}`);
    throw error;
  }
};

export {
  createAnswer,
  updateAnswer,
  getAnswers,
};
