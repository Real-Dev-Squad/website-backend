const { ERROR_MESSAGES } = require("../constants/badges");
const { fetchUser } = require("../models/users");
const firestore = require("./firestore");
const userBadgeModel = firestore.collection("userBadges");

/**
 * Convert firebase timestamp to locale date and time
 * @param  createdAt: firebase timestamp
 * @return {Promise<{date: string, time: string}}|Object>}
 */
function convertFirebaseTimestampToDateTime(createdAt) {
  const { _seconds, _nanoseconds } = createdAt;
  if (!_seconds || !_nanoseconds) throw new Error("Timestamp does not exist.");
  const serverTimestampDateTime = new Date(_seconds * 1000 + _nanoseconds / 1000000);
  const date = serverTimestampDateTime.toLocaleDateString();
  const time = serverTimestampDateTime.toLocaleTimeString();
  return {
    date,
    time,
  };
}

/**
 * Convert firebase document to badge document type
 * @param  id: firebase document id
 * @param  data: firebasee document fields
 * @return {Promise<{id: string, name: string, description: string, imageUrl: string, createdBy: string, createdAt: {date: string, time: string}}|Object>}
 */
function convertFirebaseDocumentToBadgeDocument(id, data) {
  const { createdAt, createdBy, name, description, imageUrl } = data;
  const { date, time } = convertFirebaseTimestampToDateTime(createdAt);
  return {
    id,
    name,
    description,
    imageUrl,
    createdBy,
    createdAt: {
      date,
      time,
    },
  };
}

/**
 * Creates or Deletes bulk document in batch
 * @param { Object<userId: string, array: Array<badgeId|docReferrence>, isUnassign: boolean> } user-id to assign or unassign badges, array: badgeIds or documentReferrences and isUnassign boolean flag to unassign badges(defualt value is `false`).
 * @return { Promise<void> }
 */
/**
 * [1]: https://github.com/FrangSierra/firestore-cloud-functions-typescript/blob/master/functions/src/atomic-operations/index.ts#L52
 * [2]: https://stackoverflow.com/questions/49121877/upload-more-than-500-documents-to-firestore-database-from-cloud-function (last-answer)
 * [3]: https://firebase.google.com/docs/firestore/quotas#writes_and_transactions
 * [4]: https://firebase.google.com/docs/firestore/quotas#security_rules
 * [5]: https://firebase.google.com/docs/firestore/manage-data/transactions#security_rules_limits
 */
// TODO: write generic function
async function assignUnassignBadgesInBulk({ userId, array, isUnassign = false }) {
  const bulkWriter = firestore.bulkWriter();
  array.forEach((value) => {
    if (isUnassign) {
      bulkWriter.delete(value);
      return;
    }
    bulkWriter.create(userBadgeModel.doc(), { userId, badgeId: value });
  });
  return await bulkWriter.close();
}

/**
 * Checks is user-exists, if exists return userId else throw error
 * @param  username {string}
 * @return {Promise}: <Promise<string>> returns userId
 */
async function getUserId(username) {
  const userInfo = await fetchUser({ username });
  if (!userInfo.userExists) {
    throw Error(ERROR_MESSAGES.misc.userDoesNotExist);
  }
  return userInfo.user.id;
}

module.exports = {
  convertFirebaseDocumentToBadgeDocument,
  convertFirebaseTimestampToDateTime,
  assignUnassignBadgesInBulk,
  getUserId,
};
