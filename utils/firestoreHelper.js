/**
 * Converts snapshot to array with document id as a key
 *
 * @param {Object} snapshot - Firestore snapshot object
 * @param {Object[]} [initialArray] - Array to add document objects
 * @returns {Object} - Returns array of document objects with document id included
 */
const snapshotToArray = (snapshot, initialArray = []) => {
  if (!snapshot.empty) {
    snapshot.forEach((doc) => {
      initialArray.push({
        id: doc.id,
        ...doc.data(),
      });
    });
  }

  return initialArray;
};

/**
 * Returns document data of given documents ids
 *
 * @param {Object[]} [docIds] - Array of documents ids
 * @param {Object} modelFunc - Callback model function
 * @returns {Object} - Returns array of document objects with document id included
 */
const getDocFromIds = async (docIds, modelFunc) => {
  try {
    if (!Array.isArray(docIds)) {
      return [];
    }
    const promises = docIds.map((docId) => modelFunc(docId));
    const docData = await Promise.all(promises);
    return docData;
  } catch (err) {
    logger.error(`Error populating documents in ${modelFunc}`, err);
    throw err;
  }
};

module.exports = {
  snapshotToArray,
  getDocFromIds,
};
