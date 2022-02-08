
const firestore = require('../utils/firestore')
const profileModel = firestore.collection('profileDiffs')

const fetchProfileDiffData = async (username) => {
  try {
    let profileData, id
    const profileDiff = await profileModel
      .where('username', '==', username)
      .where('approval', '==', 'PENDING')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()

    profileDiff.forEach(doc => {
      profileData = doc.data()
      id = doc.id
    })
    const { approval, timestamp, username: name, ...result } = profileData
    return {
      id,
      ...result
    }
  } catch (err) {
    logger.error('Error retrieving user data', err)
    throw err
  }
}

const addOrUpdate = async (profileData, profileId = null) => {
  try {
    const profile = await profileModel.doc(profileId).get()
    await profileModel.doc(profileId).set({
      ...profile.data(),
      ...profileData
    })
    return profileId
  } catch (err) {
    logger.error('Error in adding or updating user', err)
    throw err
  }
}

module.exports = {
  fetchProfileDiffData,
  addOrUpdate
}
