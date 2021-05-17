const firestore = require('../utils/firestore')
const notificationModal = firestore.collection('notifications')
/**
 *  Get  the notifications data for current loggedIn user
 *
 * @param currentPage { Integer }: Page for which notifications are to be fetched
 * @param limit { Integer }: Number of Notifications per page
 * @param userId { String }: userId of current loggedIn user
 * @return {Promise<notificationModal|Array>}}
 */

module.exports.fetchNotifications = async ({ currentPage, limit, userId }) => {
  try {
    const skip = (currentPage - 1) * limit

    const snapshot = await notificationModal.where('userId', '==', userId).limit(limit)
      .offset(skip)
      .get()

    const notificationsData = []

    if (!snapshot.isEmpty) {
      snapshot.forEach((doc) => {
        notificationsData.push({
          id: doc.id,
          username: doc.data().userId,
          currentPage: currentPage,
          ...doc.data(),
          userId: undefined
        })
      })
    }

    return notificationsData
  } catch (err) {
    logger.error('Error fetching notifications', err)
    throw err
  }
}
