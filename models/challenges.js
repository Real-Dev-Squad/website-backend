/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

import Firestore from "@google-cloud/firestore";
import firestore from "../utils/firestore.js";
import { fetchUser } from "./users.js";
import logger from "../utils/logger.js";

const challengesModel = firestore.collection("challenges");
const userModel = firestore.collection("users");

const CANNOT_SUBSCRIBE = "User cannot be subscribed to challenge";
const USER_DOES_NOT_EXIST_ERROR = "User does not exist. Please register to participate";
const ERROR_MESSAGE = "Error getting challenges";

/**
 * Fetch the challenges
 * @return {Promise<challengesModel|Array>}
 */
const fetchChallenges = async () => {
  try {
    const challengesSnapshot = await challengesModel.get();
    const challenges = [];
    challengesSnapshot.forEach((challengeDoc) => {
      challenges.push({
        id: challengeDoc.id,
        ...challengeDoc.data(),
      });
    });
    return challenges;
  } catch (err) {
    logger.error(ERROR_MESSAGE, err);
    throw err;
  }
};

/**
 * Fetch the <user object> from participants array
 * @param {Array} participants
 * @returns {Promise<challengesModel|Array>}
 */
const fetchParticipantsData = async (participants) => {
  try {
    const promises = participants.map(async (userId) => {
      const { user } = await fetchUser({ userId });
      return {
        ...user,
        phone: undefined,
      };
    });
    return Promise.all(promises);
  } catch (err) {
    logger.error(ERROR_MESSAGE, err);
    throw err;
  }
};

/**
 * Post a new challenge
 * @param {Object} challengeData
 * @returns {Promise<challengesModel|Object>}
 */
const postChallenge = async (challengeData) => {
  try {
    const { id } = await challengesModel.add(challengeData);
    return { id, ...challengeData };
  } catch (err) {
    logger.error(ERROR_MESSAGE, err);
    throw err;
  }
};

/**
 * Subscribe a user to a challenge
 * @param {String} userId
 * @param {String} challengeId
 * @returns {Promise<challengesModel|Object>}
 */
const subscribeUserToChallenge = async (userId, challengeId) => {
  try {
    const userDoc = await userModel.doc(userId).get();
    if (!userDoc.exists) {
      throw new Error(USER_DOES_NOT_EXIST_ERROR);
    }
    const challengeDoc = await challengesModel.doc(challengeId).get();
    if (!challengeDoc.exists) {
      throw new Error(CANNOT_SUBSCRIBE);
    }
    const challengeData = challengeDoc.data();
    const participants = challengeData.participants || [];
    if (participants.includes(userId)) {
      return challengeData;
    }
    await challengesModel.doc(challengeId).update({
      participants: Firestore.FieldValue.arrayUnion(userId),
    });
    return { ...challengeData, participants: [...participants, userId] };
  } catch (err) {
    logger.error(ERROR_MESSAGE, err);
    throw err;
  }
};

export default { fetchChallenges, fetchParticipantsData, postChallenge, subscribeUserToChallenge };
