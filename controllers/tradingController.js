const tradeModel = require('../models/trading')
/**
 * New Trading Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const trade = async (req, res) => {
  try {
    const { username } = req.params
    if (!username) {
      return res.boom.forbidden('Invalid username')
    }

    const tradingResponse = await tradeModel.trade(req.body, username)

    if (tradingResponse.userCannotPurchase) {
      return res.boom.forbidden('Trading failed due to insufficient funds')
    }

    return res.status(200).json(tradingResponse)
  } catch (err) {
    logger.error(`Error while updating task: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  trade
}
