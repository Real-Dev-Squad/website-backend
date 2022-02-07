
const firestore = require('../utils/firestore')
const profileModel = firestore.collection('profileDiffs')

const fetchProfileDiffData = async (username) => {
  try {
    let profileData
    const profileDiff = await profileModel
      .where('username', '==', username)
      .where('approval', '==', 'PENDING')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()

    profileDiff.forEach(doc => {
      profileData = doc.data()
    })
    const { approval, timestamp, username: name, ...result } = profileData
    return {
      ...result
    }
  } catch (err) {
    logger.error('Error retrieving user data', err)
    throw err
  }
}

// Add & update function

// Change approval function

module.exports = {
  fetchProfileDiffData
}
