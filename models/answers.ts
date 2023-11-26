const admin = require("firebase-admin");
const firestore = require("../utils/firestore");
const answerModel = firestore.collection("answers");
import { answer } from "../typeDefinitions/answers";
const { ANSWER_STATUS } = require("../constants/answers");

const createAnswer = async (answerData:answer) => { 
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
      approved_by: null,
      rejected_by: null,
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

module.exports = {createAnswer}