const stocks = require('../models/stocks');
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
      message: 'Stock created successfully!',
      stock: stockData,
      id,
    });
  } catch (err) {
    logger.error(`Error while creating new stock: ${err}`);
    return res.boom.badImplementation('An internal server error occurred');
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
      message: allStock.length > 0 ? 'Stocks returned successfully!' : 'No stocks found',
      stock: allStock.length > 0 ? allStock : [],
    });
  } catch (err) {
    logger.error(`Error while fetching stocks ${err}`);
    return res.boom.badImplementation('An internal server error occurred');
  }
};
/**
 * Fetches all the stocks of the user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getSelfStocks = async (req, res) => {
  try {
    const { id: userId } = req.userData;
    const userStocks = await stocks.fetchUserStocks(userId);
    return res.json({
      message: userStocks.length > 0 ? 'User stocks returned successfully!' : 'No stocks found',
      userStocks,
    });
  } catch (err) {
    logger.error(`Error while getting user stocks ${err}`);
    return res.boom.badImplementation('An internal server error occurred');
  }
};

module.exports = {
  addNewStock,
  fetchStocks,
  getSelfStocks,
};
