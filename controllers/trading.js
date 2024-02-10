const tradeService = require("../services/tradingService");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
/**
 * New Trading Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const trade = async (req, res) => {
  try {
    const { id: userId, username } = req.userData;
    const tradeStockData = {
      ...req.body,
      username,
      userId,
    };
    const { canUserTrade, errorMessage, userBalance } = await tradeService.trade(tradeStockData);

    if (!canUserTrade) {
      return res.boom.forbidden(errorMessage);
    }

    return res.json({ userBalance });
  } catch (err) {
    logger.error(`Error during trading: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  trade,
};
