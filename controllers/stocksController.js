const stocks = require('../models/stocks')
/**
 * Creates new stock
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Stock object
 * @param res {Object} - Express response object
 */
const addNewStock = async (req, res) => {
  try {
    const { id, stockDetails } = await stocks.addStock(req.body)
    return res.json({
      message: 'Stock created successfully!',
      stock: stockDetails,
      id
    })
  } catch (err) {
    logger.error(`Error while creating new stock: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}
/**
 * Fetches all the stocks
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchStocks = async (req, res) => {
  try {
    const allStock = await stocks.fetchStocks()
    return res.json({
      message: 'Stocks returned successfully!',
      stock: allStock.length > 0 ? allStock : []
    })
  } catch (err) {
    logger.error(`Error while fetching stocks ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  addNewStock,
  fetchStocks
}
