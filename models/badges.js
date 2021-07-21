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

/**
 * Fetches the data about user badges
 * @param query { Object }: Filter for badges data
 * @return {Promise<userBadgeModel|Array>}
 */

const fetchUserBadges = async (username) => {
  try {
    const snapshot = await badgeModel.get()
    const allBadges = []
    snapshot.forEach((doc) => {
      allBadges.push(doc.data())
    })
    const userBadges = []
    allBadges.forEach((badge) => {
      badge.users.forEach((user) => {
        if (user === username) {
          userBadges.push({ title: badge.title, description: badge.description })
        }
      })
    })
    return userBadges
  } catch (err) {
    logger.error('Error retrieving user badges', err)
    return err
  }
}

module.exports = {
  fetchBadges,
  fetchUserBadges
}
