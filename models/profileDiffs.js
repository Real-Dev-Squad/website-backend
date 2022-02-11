const firestore = require('../utils/firestore')
const profileDiffsModel = firestore.collection('profileDiffs')

/**
 * Fetches the pending profile diffs
 * @return {Promise<profileDiffsModel|Array>}
 */
const fetchProfileDiffs = async () => {
  try {
    const snapshot = await profileDiffsModel
      .where('approval', '==', 'PENDING')
      .get()
    const profileDiffs = []
    snapshot.forEach((doc) => {
      profileDiffs.push({
        id: doc.id,
        ...doc.data()
      })
    })
    return profileDiffs
  } catch (err) {
    logger.error('Error retrieving profile diffs ', err)
    throw err
  }
}

module.exports = {
  fetchProfileDiffs
}
