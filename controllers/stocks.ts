// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const stocks = require('../models/stocks')
/**
 * Creates new stock
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Stock object
 * @param res {Object} - Express response object
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addNewStoc... Remove this comment to see the full error message
const addNewStock = async (req: any, res: any) => {
  try {
    const { id, stockData } = await stocks.addStock(req.body)
    return res.json({
      message: 'Stock created successfully!',
      stock: stockData,
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchStock... Remove this comment to see the full error message
const fetchStocks = async (req: any, res: any) => {
  try {
    const allStock = await stocks.fetchStocks()
    return res.json({
      message: allStock.length > 0 ? 'Stocks returned successfully!' : 'No stocks found',
      stock: allStock.length > 0 ? allStock : []
    })
  } catch (err) {
    logger.error(`Error while fetching stocks ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}
/**
 * Fetches all the stocks of the user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getSelfSto... Remove this comment to see the full error message
const getSelfStocks = async (req: any, res: any) => {
  try {
    const { id: userId } = req.userData
    const userStocks = await stocks.fetchUserStocks(userId)
    return res.json({
      message: userStocks.length > 0 ? 'User stocks returned successfully!' : 'No stocks found',
      userStocks
    })
  } catch (err) {
    logger.error(`Error while getting user stocks ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  addNewStock,
  fetchStocks,
  getSelfStocks
}
