import { ERROR_MESSAGES } from "../constants/badges.js";
import { DOCUMENT_WRITE_SIZE } from "../constants/constants.js";
import { chunks } from "../utils/array.js";
import { assignOrRemoveBadgesInBulk, convertFirebaseDocumentToBadgeDocument } from "../utils/badges.js";
import firestore from "../utils/firestore.js";
import logger from "../utils/logger.js";

const badgeModel = firestore.collection("badges");
const userBadgeModel = firestore.collection("userBadges");
const MODEL_ERROR_MESSAGES = ERROR_MESSAGES.MODELS;

/**
 * Fetches the data about our badges
 * @param query { Object }: Filter for badges data
 * @return {Promise}: <badgeModel|Array> returns all badges
 */
export const fetchBadges = async ({ size = 100, page = 0 }) => {
  try {
    const snapshot = await badgeModel
      .limit(parseInt(size))
      .offset(parseInt(size) * parseInt(page))
      .get();
    // INFO: timestamp to date time logic surfaced from
    // https://stackoverflow.com/a/66292255
    return snapshot.docs.map((doc) => convertFirebaseDocumentToBadgeDocument(doc.id, doc.data()));
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.FETCH_BADGES, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.FETCH_BADGES);
  }
};

/**
 * Fetches the data about user badges
 * @param userId <string>: Filter for badges data
 * @return {Promise}: <{badges: Array<badge>} returns badges array
 */
export const fetchUserBadges = async (userId) => {
  try {
    const badgeIdsSnapshot = await userBadgeModel.where("userId", "==", userId).get();
    // INFO: if userId is incorrect it returns success response
    if (badgeIdsSnapshot.empty) {
      return { badges: [] };
    }
    const badgeDocReferences = badgeIdsSnapshot.docs.map((doc) => {
      const badgeId = doc.get("badgeId");
      return firestore.doc(`badges/${badgeId}`);
    });
    const badgeDocs = await firestore.getAll(...badgeDocReferences);
    const badges = badgeDocs.map((doc) => {
      if (!doc.exists) {
        return null;
      }
      return convertFirebaseDocumentToBadgeDocument(doc.id, doc.data());
    });
    return { badges: badges.filter(Boolean) };
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.FETCH_USER_BADGES, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.FETCH_USER_BADGES);
  }
};

/**
 * Creates a new badge
 * @param badgeInfo { Object }: Badge information
 * @return {Promise}: <badgeModel|Object> returns created badge
 */
export const createBadge = async (badgeInfo) => {
  try {
    const { id } = await badgeModel.add(badgeInfo);
    return { id, ...badgeInfo };
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.CREATE_BADGE, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.CREATE_BADGE);
  }
};

/**
 * Assigns badges to a user
 * @param userId <string>: User ID
 * @param badgeIds <Array<string>>: Array of badge IDs
 * @return {Promise}: <void>
 */
export const assignBadges = async ({ userId, badgeIds }) => {
  try {
    const badgeChunks = chunks(badgeIds, DOCUMENT_WRITE_SIZE);
    for (const chunk of badgeChunks) {
      await assignOrRemoveBadgesInBulk(userId, chunk, "assign");
    }
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.ASSIGN_BADGES, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.ASSIGN_BADGES);
  }
};

/**
 * Removes badges from a user
 * @param userId <string>: User ID
 * @param badgeIds <Array<string>>: Array of badge IDs
 * @return {Promise}: <void>
 */
export const removeBadges = async ({ userId, badgeIds }) => {
  try {
    const badgeChunks = chunks(badgeIds, DOCUMENT_WRITE_SIZE);
    for (const chunk of badgeChunks) {
      await assignOrRemoveBadgesInBulk(userId, chunk, "remove");
    }
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.REMOVE_BADGES, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.REMOVE_BADGES);
  }
};
