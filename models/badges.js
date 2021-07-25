const firestore = require('../utils/firestore')
const badgeModel = firestore.collection('badges')
const { fetchUser } = require('../models/users')

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
    const userBadges = []
    let userExists = false
    const result = await fetchUser({ username })
    if (result.userExists) {
      userExists = true
      const userID = result.user.id
      const snapshot = await badgeModel.get()
      snapshot.forEach((item) => {
        if (item.data()?.users?.includes(userID)) {
          userBadges.push({ title: item.data().title, description: item.data().description })
        }
      })
    }
    return { userExists, userBadges }
  } catch (err) {
    logger.error('Error retrieving user badges', err)
    return err
  }
}

module.exports = {
  fetchBadges,
  fetchUserBadges
}
