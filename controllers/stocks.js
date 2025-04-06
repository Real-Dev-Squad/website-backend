import stocks from "../models/stocks.js";
import { INTERNAL_SERVER_ERROR } from "../constants/errorMessages.js";
import logger from "../utils/logger.js";

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
 * WARNING: This API endpoint is being deprecated and will be removed in future.
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
      "WARNING: This endpoint is being deprecated and will be removed in the future. Please use `/stocks/:userId` route to get the user stocks details."
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
  try {
    const userStocks = await stocks.fetchUserStocks(req.params.userId);

    return res.json({
      message: userStocks.length > 0 ? "User stocks returned successfully!" : "No stocks found",
      userStocks,
    });
  } catch (err) {
    logger.error(`Error while getting user stocks ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

export { addNewStock, fetchStocks, getSelfStocks, getUserStocks };
