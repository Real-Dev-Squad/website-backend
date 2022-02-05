// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'featureFla... Remove this comment to see the full error message
const featureFlagModel = firestore.collection('featureFlags')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userModel'... Remove this comment to see the full error message
const userModel = require('./users')

/**
 * Fetch all tasks
 *
 * @return {Promise<featureFlags|Array>}
 */
const fetchFeatureFlag = async () => {
  try {
    const snapshot = await featureFlagModel.get()
    const featureFlags: any = []
    snapshot.forEach((doc: any) => {
      featureFlags.push({
        id: doc.id,
        ...doc.data()
      })
    })
    const users: any = []
    const result = {}

    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'item' implicitly has an 'any' type.
    featureFlags.forEach((item) => {
      if (!users.includes(item.owner)) { users.push(item.owner) }
    })

    let start = 0
    let end = 10

    for (let i = 0; i < Math.ceil(users.length / 10); i++) {
      const usersData = users.slice(start, end)
      const image = await userModel.fetchUserImage(usersData)
      start = end
      end += 10
      Object.assign(result, image)
    }

    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'item' implicitly has an 'any' type.
    featureFlags.forEach((item) => {
      item.owner = {
        username: item.owner,
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
const addFeatureFlags = async (featureFlag: any, username: any) => {
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'updateFeat... Remove this comment to see the full error message
const updateFeatureFlags = async (featureFlag: any, featureFlagId: any) => {
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'deleteFeat... Remove this comment to see the full error message
const deleteFeatureFlag = async (featureFlagId: any) => {
  try {
    const doc = await featureFlagModel.doc(featureFlagId).get()
    if (!doc.exists) {
      return {
        isDeleted: false
      }
    }
    await featureFlagModel.doc(featureFlagId).delete()
    return {
      isDeleted: true
    }
  } catch (err) {
    logger.error('Error in deleting featureFlag', err)
    throw err
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  fetchFeatureFlag,
  addFeatureFlags,
  updateFeatureFlags,
  deleteFeatureFlag
}
