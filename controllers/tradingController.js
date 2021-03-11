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

    if (!tradingResponse.canUserTrade) {
      return res.boom.forbidden(tradingResponse.errorMessage)
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
