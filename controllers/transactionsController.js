const transactionsModel = require('../models/transaction')

/**
 * Collects all transactions and sends only required data for each userId
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const fetchLatest = async (req, res) => {
  try {
    const userId = req.params.userId
    const noOfRecords = req.params.noOfRecords
    const data = await transactionsModel.fetchLatest(userId, noOfRecords)
    return res.json({
      message: 'Transactions returned successfully!',
      responseCode: 200,
      data
    })
  } catch (err) {
    logger.error(`Error while processing transactions fetch request: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  fetchLatest
}
