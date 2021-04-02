const transactionsModel = require('../models/transaction')
const { getUserId } = require('../utils/users')

/**
 * Collects all transactions and sends only required data for username spicified in url
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const fetchLatest = async (req, res) => {
  try {
    const userId = await getUserId(req.params.username)
    if (userId !== undefined) {
      const noOfRecords = req.query.noOfRecords
      const data = await transactionsModel.fetchLatest(userId, noOfRecords)
      if (data.length > 0) {
        return res.json({
          message: 'Transactions returned successfully!',
          responseCode: 200,
          data
        })
      } else {
        return res.json({
          message: 'No record exist!'
        })
      }
    } else {
      return res.json({
        message: 'User does not exist!'
      })
    }
  } catch (err) {
    logger.error(`Error while processing transactions fetch request: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  fetchLatest
}
