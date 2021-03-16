const firestore = require('../utils/firestore')
const stocksModel = firestore.collection('stocks')
const userStocksModel = firestore.collection('user-stocks')

/**
 * Adds Stocks
 *
 * @param stockData { Object }: stock data object to be stored in DB
 * @return {Promise<{stockId: string}>}
 */
const addStock = async (stockData) => {
  try {
    const { id } = await stocksModel.add(stockData)
    return { id, stockData }
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
 * Fetches the user stocks
 * @return {Promise<userStocks|object>}
 */
const fetchUserStocks = async (userId, stockId = null) => {
  try {
    userStocksModel.where('userId', '==', userId)

    if (stockId) {
      userStocksModel.where('stockId', '==', stockId)
    }
    const { docs } = await userStocksModel.get()
    const [userStocks] = docs
    if (userStocks) {
      return { id: userStocks.id, ...userStocks.data() }
    }
    return {}
  } catch (err) {
    logger.error('Error retrieving user stocks', err)
    throw err
  }
}

/**
 * Create user stocks
 * @return {Promise<userStocks|object>}
 */
const createUserStock = async (userId, stockData) => {
  try {
    const userStocks = {
      userId,
      ...stockData
    }
    const { id } = await userStocksModel.add(userStocks)
    return {
      id
    }
  } catch (err) {
    logger.error('Error creating user stocks', err)
    throw err
  }
}

/**
 * Update Users Stocks
 * @return {Promise<userStocks|object>}
 */
const updateUserStocks = async (userId, stockData) => {
  try {
    const userStocks = await fetchUserStocks(userId, stockData.stockId)
    if (!userStocks.id) {
      await createUserStock(userId, stockData)
      return true
    }

    const userStocksRef = userStocksModel.doc(userStocks.id)
    const res = await userStocksRef.update(stockData)
    if (res) {
      return true
    }
    return false
  } catch (err) {
    logger.error('Error updating users stocks', err)
    throw err
  }
}

module.exports = {
  addStock,
  fetchStocks,
  fetchUserStocks,
  updateUserStocks
}
