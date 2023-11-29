const admin = require("firebase-admin");
const firestore = require("../utils/firestore");
const answerModel = firestore.collection("answers");
import { Answer, AnswerBody, AnswerFieldsToUpdate } from "../typeDefinitions/answers";
const { ANSWER_STATUS } = require("../constants/answers");

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

const getAnswers = async (queryFields) => {
  console.log({ getanswermode: queryFields });
  const questionId = queryFields.questionId || "";
  const eventId = queryFields.eventId || "";
  const status = queryFields.status || "";
  let answersRef = answerModel;
  let answers: Answer[] = [];

  try {
    answersRef = questionId ? answersRef.where("question_id", "==", questionId) : answersRef;
    answersRef = eventId ? answersRef.where("event_id", "==", eventId) : answersRef;
    answersRef = status ? answersRef.where("status", "==", status) : answersRef;

    const answerSnapshot = await answersRef.get();

    answerSnapshot.forEach((answer) => {
      answers.push({ id: answer.id, ...answer.data() });
    });

    return answers;
  } catch (error) {
    logger.error(`Some error occured while getting answers ${error}`);
    throw error;
  }
};

module.exports = { createAnswer, updateAnswer, getAnswers };
