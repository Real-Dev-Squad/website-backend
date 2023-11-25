/* eslint-disable camelcase */
const admin = require("firebase-admin");
const firestore = require("../utils/firestore");
const logger = require("../utils/logger");

const questionModel = firestore.collection("questions");

const createQuestion = async (questionData) => {
  try {
    const { eventId: event_id, createdBy: created_by, question, maxCharacters: max_characters } = questionData;
    const questionRef = questionModel.doc(questionData.id);
    const createdAndUpdatedAt = admin.firestore.Timestamp.now();

    await questionRef.set({
      question,
      event_id,
      created_by,
      max_characters: max_characters || null,
      is_new: true,
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

const getQuestions = async (query) => {
  try {
    const isNew = Boolean(query.isNew);
    let questionFromDB, id;

    const questionSnapshot = await questionModel.where("is_new", "==", isNew).limit(1).get();

    questionSnapshot.forEach((question) => {
      id = question.id;
      questionFromDB = question.data();
    });

    return { id, ...questionFromDB };
  } catch (error) {
    logger.error(`Some error occured while getting question ${error}`);
    throw error;
  }
};

const updateQuestion = async (id, fieldsToUpdate) => {
  try {
    const questionRef = questionModel.doc(id);

    await questionRef.update({ ...fieldsToUpdate });

    const questionSnapshot = await questionRef.get();
    const question = questionSnapshot.data();

    return { id: questionSnapshot.id, ...question };
  } catch (error) {
    logger.error(`Some error occured while updating question ${error}`);
    throw error;
  }
};

module.exports = { createQuestion, getQuestions, updateQuestion };
