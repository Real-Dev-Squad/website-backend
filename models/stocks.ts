// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'stocksMode... Remove this comment to see the full error message
const stocksModel = firestore.collection('stocks')
const userStocksModel = firestore.collection('user-stocks')

/**
 * Adds Stocks
 *
 * @param stockData { Object }: stock data object to be stored in DB
 * @return {Promise<{stockId: string}>}
 */
const addStock = async (stockData: any) => {
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchStock... Remove this comment to see the full error message
const fetchStocks = async () => {
  try {
    const stockSnapshot = await stocksModel.get()
    const stocks: any = []
    stockSnapshot.forEach((stock: any) => {
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUserS... Remove this comment to see the full error message
const fetchUserStocks = async (userId: any, stockId = null) => {
  try {
    let userStocksRef = ''
    const query = userStocksModel.where('userId', '==', userId)
    if (stockId) {
      userStocksRef = await query.where('stockId', '==', stockId).get()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'docs' does not exist on type 'string'.
      const [userStocks] = userStocksRef.docs
      if (userStocks) {
        return { id: userStocks.id, ...userStocks.data() }
      }
      return {}
    }

    userStocksRef = await query.get()
    const userStocks: any = []
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'forEach' does not exist on type 'string'... Remove this comment to see the full error message
    userStocksRef.forEach((stock: any) => {
      userStocks.push({
        id: stock.id,
        ...stock.data()
      })
    })
    return userStocks
  } catch (err) {
    logger.error('Error retrieving user stocks', err)
    throw err
  }
}

/**
 * Update Users Stocks
 * @return {Promise<userStocks|object>}
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'updateUser... Remove this comment to see the full error message
const updateUserStocks = async (userId: any, stockData: any) => {
  try {
    const userStocks = await fetchUserStocks(userId, stockData.stockId)
    if (!userStocks.id) {
      await userStocksModel.add({
        userId,
        ...stockData
      })
      return true
    }

    const userStocksRef = userStocksModel.doc(userStocks.id)
    const res = await userStocksRef.update(stockData)
    return !!res
  } catch (err) {
    logger.error('Error updating users stocks', err)
    throw err
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  addStock,
  fetchStocks,
  fetchUserStocks,
  updateUserStocks
}
