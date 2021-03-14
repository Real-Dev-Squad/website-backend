const firestore = require('../utils/firestore')
const stocksModel = firestore.collection('stocks')
const transactionsModel = firestore.collection('transactions')
const tradeLogsModel = firestore.collection('trade-logs')

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
 * @return {Promise<{taskId: string}>}
 */
const trade = async (tradeData) => {
  try {
    const { stockID, quantity, tradeType, totalPrice } = tradeData
    const stockCollection = await stocksModel.doc(stockID).get()
    const stockData = stockCollection.data()
    let userBalance = 0
    let quantityToUpdate = 0
    let stockPriceToBeUpdated = stockData.price
    let orderValue = 0
    let qtyUserCanPurchase = 0

    switch (tradeType) {
      case 'SELL': {
        quantityToUpdate = quantity + stockData.quantity
        userBalance = quantity * stockData.price
        stockPriceToBeUpdated = getUpdatedPrice(stockData.price)
        break
      }
      case 'BUY': {
        qtyUserCanPurchase = Math.floor(totalPrice / stockData.price)
        if (qtyUserCanPurchase <= 0) {
          return { canUserTrade: false, errorMessage: 'Trade was not successful due to insufficient funds' }
        }
        orderValue = qtyUserCanPurchase * stockData.price
        quantityToUpdate = stockData.quantity - qtyUserCanPurchase
        userBalance = orderValue - totalPrice

        stockPriceToBeUpdated = getUpdatedPrice(stockData.price)
        break
      }
      default: {
        return { canUserTrade: false, errorMessage: 'Invalid trade type' }
      }
    }

    const updatedStockData = {
      ...stockData,
      quantity: quantityToUpdate,
      price: stockPriceToBeUpdated
    }

    // Transaction Log

    const { id } = await tradeLogsModel.add({
      type: `STOCK_${tradeType}`,
      userId: tradeData.userId,
      stockName: stockData.name,
      orderValue,
      quantity: qtyUserCanPurchase,
      price: stockData.price,
      timestamp: +Date.now()
    })

    await transactionsModel.add({
      userId: tradeData.userId,
      type: `STOCK_${tradeType}`,
      refId: id,
      timestamp: +Date.now()
    })

    // we will be adding logic here to update user funds

    await stocksModel.doc(stockID).set(updatedStockData)
    return { userBalance, canUserTrade: true }
  } catch (err) {
    logger.error('Error in trading', err)
    throw err
  }
}

module.exports = {
  trade
}
