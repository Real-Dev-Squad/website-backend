const notificationQuery = require('../models/notifications')
const { DEFAULT_LIMIT, DEFAULT_CURRENT_PAGE } = require('../constants/pagination')
/**
 * Fetches the notifications data for current user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getNotificationsForUser = async (req, res) => {
  try {
    const { page: currentPage = DEFAULT_CURRENT_PAGE, n: limit = DEFAULT_LIMIT } = req.query
    const { id: userId } = req.userData

    const parsedCurrentPage = (isNaN(currentPage) || +currentPage <= 0) ? 1 : +currentPage
    const parsedLimit = (isNaN(limit) || +limit <= 0) ? 10 : +limit

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
