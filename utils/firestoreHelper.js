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
        ...doc.data()
      })
    })
  }

  return initialArray
}

module.exports = {
  snapshotToArray
}
