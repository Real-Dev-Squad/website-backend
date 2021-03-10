const firestore = require('../utils/firestore')
const stocksModel = firestore.collection('stocks')
/**
 * Adds Stocks
 *
 * @param stockData { Object }: stock data object to be stored in DB
 * @return {Promise<{stockId: string}>}
 */
const addStock = async (stockData) => {
  try {
    const { id } = await stocksModel.add(stockData)
    const { stockDetails } = await fetchStock(id)
    return { id, stockDetails }
  } catch (err) {
    logger.error('Error in creating stock', err)
    throw err
  }
}

/**
 * Fetch all stocks
 *
 * @return {Promise<stocks|Array>}
 */
const fetchStocks = async () => {
  try {
    const stockSnapshot = await stocksModel.get()
    const stocks = []
    stockSnapshot.forEach((stock) => {
      stocks.push({
        id: stock.id,
        ...stock.data()
      })
    })
    return stocks
  } catch (err) {
    logger.error('error getting stocks', err)
    throw err
  }
}

/**
 * Fetch a stock
 * @param stockId { string }: stockid which will be used to fetch the stock
 * @return {Promise<stockDetails|Object>}
 */
const fetchStock = async (stockId) => {
  try {
    const stock = await stocksModel.doc(stockId).get()
    return { stockDetails: stock.data() }
  } catch (err) {
    logger.error('Error retrieving stock data', err)
    throw err
  }
}

module.exports = {
  addStock,
  fetchStocks
}
