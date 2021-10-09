const tradeService = require('../services/tradingService')
/**
 * New Trading Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const trade = async (req, res) => {
  try {
    const { id: userId, username } = req.userData
    const tradeStockData = {
      ...req.body,
      username,
      userId
    }
    const { canUserTrade, errorMessage, userBalance } = await tradeService.trade(tradeStockData)

    if (!canUserTrade) {
      return res.boom.forbidden(errorMessage)
    }

    return res.json({ userBalance })
  } catch (err) {
    logger.error(`Error during trading: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  trade
}
