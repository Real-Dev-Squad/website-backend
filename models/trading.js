const firestore = require('../utils/firestore')

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

    if (tradeType === 'SELL') {
      quantityToUpdate = quantity + stockData.quantity
    } else {
      const qtyUserCanPurchase = Math.floor(totalPrice / stockData.price)
      if (qtyUserCanPurchase <= 0) {
        return { userCannotPurchase: true }
      }
      quantityToUpdate = stockData.quantity - qtyUserCanPurchase
      userBalance = qtyUserCanPurchase * stockData.price - totalPrice
    }

    const updatedStockData = {
      ...stockData,
      quantity: quantityToUpdate
    }

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
