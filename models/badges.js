const firestore = require('../utils/firestore')
const badgeModel = firestore.collection('badges')

/**
 * Fetches the data about our badges
 * @param query { Object }: Filter for badges data
 * @return {Promise<badgeModel|Array>}
 */

const fetchBadges = async ({
  size = 100,
  page = 0
}) => {
  try {
    const snapshot = await badgeModel
      .limit(parseInt(size))
      .offset((parseInt(size)) * (parseInt(page)))
      .get()
    const allBadges = []
    snapshot.forEach((doc) => {
      allBadges.push({
        id: doc.id,
        ...doc.data()
      })
    })
    return allBadges
  } catch (err) {
    logger.error('Error retrieving badges', err)
    return err
  }
}

/**
 * Create the badge data
 *
 * @param badgeData { Object }: Badge data object to be stored in DB
 * @return {Promise<badgeModel|Array>}
 */

const createBadges = async (badgeData) => {
  try {
    const snapshot = await badgeModel
    snapshot.add(badgeData)

    const allBadges = []
    snapshot.get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          allBadges.push({
            id: doc.id,
            ...doc.data()
          })
        })
      })

    return allBadges
  } catch (err) {
    logger.error('Error retrieving badges', err)
    return err
  }
}

/**
 * Updates the badge data
 *
 * @param badgeData { Object }: Badge data object to be stored in DB
 * @param badgeId { String }: Badge Id String to be used to update the badge
 * @return {Promise<{ badgeId: string }|{ badgeId: string >}
 */

const updateBadges = async (badgeData, badgeId = null) => {
  try {
    const snapshot = await badgeModel
    snapshot.doc(badgeId).update({ ...badgeData })

    const allBadges = []
    snapshot.get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          allBadges.push({
            id: doc.id,
            ...doc.data()
          })
        })
      })

    return allBadges
  } catch (err) {
    logger.error('Error retrieving badges', err)
    return err
  }
}

module.exports = {
  fetchBadges,
  createBadges,
  updateBadges
}
