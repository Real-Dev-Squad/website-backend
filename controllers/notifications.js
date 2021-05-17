const notificationQuery = require('../models/notifications')
/**
 * Fetches the notifications data for current user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getNotificationsForUser = async (req, res) => {
  try {
    let { page: currentPage, n: limit } = req.query
    const { id: userId } = req.userData

    if (!currentPage) {
      currentPage = 1
    }

    if (!limit) {
      limit = 10
    }

    let parsedCurrentPage = +currentPage
    let parsedLimit = +limit

    if (isNaN(parsedCurrentPage) || parsedCurrentPage <= 0) {
      parsedCurrentPage = 1
    }

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      parsedLimit = 10
    }

    const paginatedNotifications = await notificationQuery.fetchNotifications({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      userId
    })

    return res.status(200).json({
      message: 'Notifications returned successfully!',
      data: paginatedNotifications || []
    })
  } catch (error) {
    logger.error(`Error while fetching notifications: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getNotificationsForUser
}
