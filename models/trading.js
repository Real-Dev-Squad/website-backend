const firestore = require('../utils/firestore')

/**
 * Updates the stock Price
 *
 * @param stockPrice { number }: Stock price
 * @return {stockPrice: number}
 */
const getUpdatedPrice = (stockPrice) => {
  // We will be adding logic to update the stock price each a trading take place
  return stockPrice
}

/**
 * New trade
 *
 * @param tradeData { Object }: new trading data
 * @param username { string }: username for the user who is trading
 * @return {Promise<{taskId: string}>}
 */
const trade = async (tradeData, username = null) => {
  try {
    const { stockName, quantity, tradeType, totalPrice } = tradeData
    const stockCollection = await firestore.collection('stocks').doc(stockName)
    const stockData = stockCollection.get().data()
    let userBalance = 0
    let quantityToUpdate = 0
    let stockPriceToBeUpdated = stockData.price

    switch (tradeType) {
      case 'SELL': {
        quantityToUpdate = quantity + stockData.quantity
        stockPriceToBeUpdated = getUpdatedPrice(stockData.price)
        break
      }
      case 'BUY': {
        const qtyUserCanPurchase = Math.floor(totalPrice / stockData.price)
        if (qtyUserCanPurchase <= 0) {
          return { userCannotPurchase: true }
        }
        quantityToUpdate = stockData.quantity - qtyUserCanPurchase
        userBalance = qtyUserCanPurchase * stockData.price - totalPrice

        stockPriceToBeUpdated = getUpdatedPrice(stockData.price)
        break
      }
      default: {
        return { canUserTrade: false, errorMessage: 'Invalid tarde type' }
      }
    }

    const updatedStockData = {
      ...stockData,
      quantity: quantityToUpdate,
      price: stockPriceToBeUpdated
    }

    // we will be adding logic here to create a transaction log

    await stockCollection.set(updatedStockData)
    return { userBalance }
  } catch (err) {
    logger.error('Error in trading', err)
    throw err
  }
}

module.exports = {
  trade
}
