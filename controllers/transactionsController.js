const transactionsModel = require('../models/transaction')

/**
 * Collects all transactions and sends only required data for each userId
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const fetchLatestTransactions = async (req, res) => {
  try {
    const userId = req.params.userId
    const data  = await transactionsModel.fetchLatestTransactions(userId)
    return res.json({
      data
    });
  } catch (err) {
    logger.error(`Error while processing transactions fetch request: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  fetchLatestTransactions
}
