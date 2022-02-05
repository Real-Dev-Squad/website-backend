// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
const badgeModel = firestore.collection('badges')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUser'... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      .limit(parseInt(size))
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      .offset((parseInt(size)) * (parseInt(page)))
      .get()

    const allBadges: any = []
    snapshot.forEach((doc: any) => {
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

const fetchUserBadges = async (username: any) => {
  try {
    const userBadges: any = []
    let userExists = false
    const result = await fetchUser({ username })
    if (result.userExists) {
      userExists = true
      const userID = result.user.id
      const snapshot = await badgeModel.get()

      snapshot.forEach((item: any) => {
        if (item.data()?.users?.includes(userID)) {
          const { title, description } = item.data()
          userBadges.push({ title, description })
        }
      })
    }

    return { userExists, userBadges }
  } catch (err) {
    logger.error('Error retrieving user badges', err)
    return err
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  fetchBadges,
  fetchUserBadges
}
