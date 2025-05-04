import { trade as tradeService } from "../services/tradingService.js";
import { INTERNAL_SERVER_ERROR } from "../constants/errorMessages.js";
import logger from "../utils/logger.js";

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
    const { canUserTrade, errorMessage, userBalance } = await tradeService(tradeStockData);

    if (!canUserTrade) {
      return res.boom.forbidden(errorMessage);
    }
    return res.json({ message: "Congrats, Stock Trade done successfully!! 🎉🎉🎉🎊🎊🎊", userBalance });
  } catch (err) {
    logger.error(`Error during trading: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

export { trade };
