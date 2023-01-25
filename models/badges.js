const admin = require("firebase-admin");
const firestore = require("../utils/firestore");
const badgeModel = firestore.collection("badges");
const userBadgeModel = firestore.collection("userBadges");
const {
  convertFirebaseTimestampToDateTime,
  convertFirebaseDocumentToBadgeDocument,
  assignOrRemoveBadgesInBulk,
} = require("../utils/badges");
const { chunks } = require("../utils/array");
const { DOCUMENT_WRITE_SIZE, ERROR_MESSAGES } = require("../constants/badges");
const MODEL_ERROR_MESSAGES = ERROR_MESSAGES.MODELS;

/**
 * Fetches the data about our badges
 * @param query { Object }: Filter for badges data
 * @return {Promise}: <badgeModel|Array> returns all badges
 */
const fetchBadges = async ({ size = 100, page = 0 }) => {
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
async function fetchUserBadges(userId) {
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
    // INFO: getAll accepts unpacked array
    // TODO: check getAll limitiations
    const badgesSnapshot = await firestore.getAll(...badgeDocReferences);
    const badges = badgesSnapshot.map((doc) => convertFirebaseDocumentToBadgeDocument(doc.id, doc.data()));
    return { badges };
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.FETCH_USER_BADGES, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.FETCH_USER_BADGES);
  }
}

/**
 * Add badge to firestore
 * @param  badgeInfo { Object }: has badge name, description, imageUrl and createdBy
 * @return {Promise}: <{id: string, createdAt: {date: string, time: string}, data: any> returns badge object
 */
async function createBadge(badgeInfo) {
  try {
    const createdAt = admin.firestore.Timestamp.now();
    // INFO: description is optional
    const description = badgeInfo.description ?? "";
    const docRef = await badgeModel.add({
      ...badgeInfo,
      description,
      createdAt,
    });
    const { date, time } = convertFirebaseTimestampToDateTime(createdAt);
    const snapshot = await docRef.get();
    const data = snapshot.data();
    return { id: docRef.id, ...data, createdAt: { date, time } };
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.CREATE_BADGE, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.CREATE_BADGE);
  }
}

/**
 * assign badges to a user
 * @param { Object }: userId: string and badgeIds: Array<string>
 * @return {Promise}: <Promise<void>> returns void promise
 */
async function assignBadges({ userId, badgeIds }) {
  try {
    const badgeIdsChunks = chunks(badgeIds, DOCUMENT_WRITE_SIZE);
    const bulkWriterBatches = badgeIdsChunks.map((value) => assignOrRemoveBadgesInBulk({ userId, array: value }));
    return await Promise.all(bulkWriterBatches);
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.ASSIGN_BADGES, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.ASSIGN_BADGES);
  }
}

/**
 * remove assigned badges from a user
 * @param { Object }: userId: string and badgeIds: Array<string>
 * @return {Promise}: <Promise<void>> returns void promise
 */
async function removeBadges({ userId, badgeIds }) {
  try {
    const snapshot = await userBadgeModel.where("userId", "==", userId).where("badgeId", "in", badgeIds).get();
    // INFO[Promise.resolve]: trick to silent eslint: consistent-return
    if (snapshot.empty) {
      return Promise.resolve();
    }
    const documentRefferences = snapshot.docs.map((doc) => doc.ref);
    const documentsRefferencesChunks = chunks(documentRefferences, DOCUMENT_WRITE_SIZE);
    const bulkWriterBatches = documentsRefferencesChunks.map((value) =>
      assignOrRemoveBadgesInBulk({ userId, array: value, isRemove: true })
    );
    return await Promise.all(bulkWriterBatches);
  } catch (err) {
    logger.error(MODEL_ERROR_MESSAGES.REMOVE_BADGES, err);
    throw Error(err?.message ?? MODEL_ERROR_MESSAGES.REMOVE_BADGES);
  }
}

module.exports = {
  fetchBadges,
  fetchUserBadges,
  createBadge,
  assignBadges,
  removeBadges,
};
