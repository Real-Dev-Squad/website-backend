const tradeModel = require('../models/trading')
/**
 * New Trading Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const trade = async (req, res) => {
  try {
    const { username } = req.userData
    const tradeStockData = {
      ...req.body,
      username
    }
    const { canUserTrade, errorMessage, userBalance } = await tradeModel.trade(tradeStockData)

    if (!canUserTrade) {
      return res.boom.forbidden(errorMessage)
    }

    return res.json({ userBalance })
  } catch (err) {
    logger.error(`Error while updating task: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  trade
}
