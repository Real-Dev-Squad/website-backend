
const firestore = require('../utils/firestore')
const profileDiffsModel = firestore.collection('profileDiffs')

/**
 * Fetches the data about our users
 * @param username { String }: Username of the user to fetch data of
 * @return {Promise<profileDiffsModel>}
 */
const fetchProfileDiffsData = async (username) => {
  try {
    let profileDiffsData, id
    const profileDiffs = await profileDiffsModel
      .where('username', '==', username)
      .where('approval', '==', 'PENDING')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()

    profileDiffs.forEach(doc => {
      profileDiffsData = doc.data()
      id = doc.id
    })
    const { approval, timestamp, username: name, ...result } = profileDiffsData
    return {
      id,
      ...result
    }
  } catch (err) {
    logger.error('Error retrieving profile diffs data', err)
    throw err
  }
}

/**
 * Sets the user picture field of passed UserId to image data
 *
 * @param profileDiffsData { Object }: Data to be added
 */
const add = async (profileDiffsData) => {
  try {
    await profileDiffsModel.add({
      ...profileDiffsData
    })
  } catch (err) {
    logger.error('Error in adding profile diffs', err)
    throw err
  }
}

/**
 * Sets the user picture field of passed UserId to image data
 *
 * @param profileDiffsData { Object }: Data to be added
 * @param profileId { String }: Id of the profileDiff
 */
const update = async (profileDiffsData, profileId) => {
  try {
    const profileDiffs = await profileDiffsModel.doc(profileId).get()
    await profileDiffsModel.doc(profileId).set({
      ...profileDiffs.data(),
      ...profileDiffsData
    })
  } catch (err) {
    logger.error('Error in updating user', err)
    throw err
  }
}

module.exports = {
  fetchProfileDiffsData,
  add,
  update
}
