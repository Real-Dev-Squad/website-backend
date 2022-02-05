// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const tradeService = require('../services/tradingService')
/**
 * New Trading Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'trade'.
const trade = async (req: any, res: any) => {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  trade
}
