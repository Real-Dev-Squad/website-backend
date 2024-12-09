const stocks = require("../models/stocks");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
/**
 * Creates new stock
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Stock object
 * @param res {Object} - Express response object
 */
const addNewStock = async (req, res) => {
  try {
    const { id, stockData } = await stocks.addStock(req.body);
    return res.json({
      message: "Stock created successfully!",
      stock: stockData,
      id,
    });
  } catch (err) {
    logger.error(`Error while creating new stock: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
/**
 * Fetches all the stocks
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchStocks = async (req, res) => {
  try {
    const allStock = await stocks.fetchStocks();
    return res.json({
      message: allStock.length > 0 ? "Stocks returned successfully!" : "No stocks found",
      stock: allStock.length > 0 ? allStock : [],
    });
  } catch (err) {
    logger.error(`Error while fetching stocks ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
/**
 * Fetches all the stocks of the user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
/**
 * @deprecated
 * WARNING: This API endpoint is being deprecated and will be removed in future versions.
 * Please use the updated API endpoint: `/stocks/:userId` for retrieving user stocks details.
 *
 * This API is kept temporarily for backward compatibility.
 */
const getSelfStocks = async (req, res) => {
  try {
    const { id: userId } = req.userData;
    const userStocks = await stocks.fetchUserStocks(userId);

    res.set(
      "X-Deprecation-Warning",
      "WARNING: This endpoint is deprecated and will be removed in the future. Please use `/stocks/:userId` route to get the user stocks details."
    );
    return res.json({
      message: userStocks.length > 0 ? "User stocks returned successfully!" : "No stocks found",
      userStocks,
    });
  } catch (err) {
    logger.error(`Error while getting user stocks ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Fetches all the stocks of the authenticated user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserStocks = async (req, res) => {
  const { id: authenticatedUserId } = req.userData;
  const userId = req.params.userId;

  try {
    if (userId !== authenticatedUserId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const userStocks = await stocks.fetchUserStocks(userId);

    if (userStocks.length === 0) {
      logger.info(`No stocks found for user ${userId}`);
      return res.status(204).json({ message: "No stocks found", userStocks: [] });
    }

    return res.json({
      message: "User stocks returned successfully!",
      userStocks,
    });
  } catch (err) {
    logger.error(`Error while getting user stocks ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  addNewStock,
  fetchStocks,
  getSelfStocks,
  getUserStocks,
};
