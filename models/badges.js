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
      allBadges.push(doc.data())
    })
    return allBadges
  } catch (err) {
    logger.error('Error retrieving badges', err)
    return err
  }
}

module.exports = {
  fetchBadges
}
