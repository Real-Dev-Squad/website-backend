const notificationQuery = require('../models/notifications')
/**
 * Fetches the data about our users
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

module.exports.getNotificationsForUser = async (req, res) => {
  try {
    const { page: currentPage, n: limit } = req.query
    // const { id: userId } = req.userData

    if (!currentPage || !limit) {
      logger.error('currentPage/ limit not present in the query')
      return res.boom.badRequest('Please check your query again')
    }

    const parsedCurrentPage = +currentPage
    const parsedLimit = +limit

    if (isNaN(parsedCurrentPage) || isNaN(parsedLimit) || parsedCurrentPage <= 0 || parsedLimit <= 0) {
      logger.error('page/limit are not valid integers present in the query')
      return res.boom.badRequest('Please check your query again')
    }

    const paginatedNotifications = await notificationQuery.fetchNotifications({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      // TODO userId
      userId: ''
    })

    return res.json({
      message: 'Notifications returned successfully!',
      data: paginatedNotifications || []
    })
  } catch (error) {
    logger.error(`Error while fetching notifications: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}
