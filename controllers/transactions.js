const { TRANSACTIONS_FETCH_LIMIT } = require('../constants/transactions')
const transactionsModel = require('../models/transaction')
const { getUserId } = require('../utils/users')

/**
 * Collects all transactions and sends only required data for username spicified in url
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const fetchTransactionsByUserId = async (req, res) => {
  try {
    const userId = await getUserId(req.params.username)
    if (userId) {
      const orderBy = req.query.orderBy || 'DESC'
      const offset = parseInt(req.query.offset, 10) || 0
      const limit = parseInt(req.query.limit, 10) + offset || TRANSACTIONS_FETCH_LIMIT
      const data = await transactionsModel.fetchTransactionsByUserId(userId, offset, limit, orderBy)
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
  fetchTransactionsByUserId
}
