const firestore = require('../utils/firestore')
const featureFlagModel = firestore.collection('featureFlags')
const userModel = require('./users')

/**
 * Fetch all tasks
 *
 * @return {Promise<featureFlags|Array>}
 */
const fetchFeatureFlag = async () => {
  try {
    const snapshot = await featureFlagModel.get()
    const featureFlags = []
    snapshot.forEach((doc) => {
      featureFlags.push({
        id: doc.id,
        ...doc.data()
      })
    })
    const users = []
    const result = {}

    featureFlags.forEach((item) => {
      if (!users.includes(item.owner)) { users.push(item.owner) }
    })

    const getImage = async (usersData) => {
      return await userModel.fetchUserImage(usersData)
    }

    let start = 0
    let end = 10

    for (let i = 0; i < Math.ceil(users.length / 10); i++) {
      const usersData = users.slice(start, end)
      start = end
      end += 10
      const image = await getImage(usersData)
      Object.assign(result, image)
    }

    featureFlags.forEach((item) => {
      item.owner = {
        username: item.owner,
        img: result[item.owner]
      }
    })
    return featureFlags
  } catch (err) {
    logger.error('error getting featureFlags', err)
    throw err
  }
}

/**
 * Add the feature flag data
 *
 * @param featureFlagData { Object }: featureFlag data object to be stored in DB
 * @param username { String }: Username String to be used to add owner in feature flag object
 * @return {Promise<{featureFlagData:object}>}
 */
const addFeatureFlags = async (featureFlag, username) => {
  try {
    featureFlag.created_at = Date.now()
    featureFlag.updated_at = featureFlag.created_at
    featureFlag.owner = username
    const { id } = await featureFlagModel.add(featureFlag)
    const featureFlagData = (await featureFlagModel.doc(id).get()).data()
    featureFlagData.id = id
    return featureFlagData
  } catch (err) {
    logger.error('Error in adding featureFlag', err)
    throw err
  }
}

/**
 * Adds or updates the feature flag data
 *
 * @param featureFlag { Object }: feature flag data object to be stored in DB
 * @param featureFlagId { String }: feature flag Id String to be used to update the feature Flag
 * @return {Promise<{isUpdated: boolean}>}
 */
const updateFeatureFlags = async (featureFlag, featureFlagId) => {
  try {
    const doc = await featureFlagModel.doc(featureFlagId).get()
    if (!doc.data()) {
      return {
        isUpdated: false
      }
    }
    if (doc.data()) {
      featureFlag.updated_at = Date.now()
      featureFlag.launched_at = Date.now()
      await featureFlagModel.doc(featureFlagId).set({
        ...doc.data(),
        ...featureFlag
      })
    }
    return {
      isUpdated: true
    }
  } catch (err) {
    logger.error('Error in updating featureFlag', err)
    throw err
  }
}

/**
 * Delete the feature flag data
 *
 * @param featureFlagId { String }: feature flag Id String to be used to delete the feature Flag
 * @return {Promise<{isDeleted: boolean}>}
 */
const deleteFeatureFlag = async (featureFlagId) => {
  try {
    const doc = await featureFlagModel.doc(featureFlagId).get()
    if (!doc.exists) {
      return {
        isDeleted: false
      }
    }
    return {
      isDeleted: true
    }
  } catch (err) {
    logger.error('Error in deleting featureFlag', err)
    throw err
  }
}

module.exports = {
  fetchFeatureFlag,
  addFeatureFlags,
  updateFeatureFlags,
  deleteFeatureFlag
}
