const transactionsModel = require('../models/transaction')
const { getUserId } = require('../utils/users')

/**
 * Collects all transactions and sends only required data for username spicified in url
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const fetch = async (req, res) => {
  try {
    const userId = await getUserId(req.params.username)
    if (userId) {
      const orderBy = parseInt(req.query.orderBy, 10) || 'DESC'
      const startAt = parseInt(req.query.startAt, 10) || 0
      const limit = parseInt(req.query.limit, 10) + startAt || 10
      const data = await transactionsModel.fetch(userId, startAt, limit, orderBy)
      return res.json({
        message: data.length > 0 ? 'Transactions returned successfully!' : 'No transactions exist!',
        data
      })
    } else {
      return res.boom.notFound('User does not exist!')
    }
  } catch (err) {
    logger.error(`Error while processing transactions fetch request: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  fetch
}
