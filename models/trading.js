const firestore = require('../utils/firestore')
const stocksModel = firestore.collection('stocks')
const transactionsModel = firestore.collection('transactions')
const tradeLogsModel = firestore.collection('trade-logs')
const { fetchWallet, updateWallet } = require('../models/wallets')

const INSUFFICIENT_FUNDS = 'Trade was not successful due to insufficient funds'

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
  // ! TODO - update as per curreny type, currently only using dinero
  try {
    const { stockId, quantity, tradeType, totalPrice, userId } = tradeData
    const stockCollection = await stocksModel.doc(stockId).get()
    const stockData = stockCollection.data()
    let userBalance = 0
    let quantityToUpdate = 0
    let stockPriceToBeUpdated = stockData.price
    let orderValue = 0
    let qtyUserCanPurchase = 0

    const { currencies } = await fetchWallet(userId)
    const updatedCurrencyData = {}

    if (!currencies) {
      return { canUserTrade: false, errorMessage: INSUFFICIENT_FUNDS }
    }

    switch (tradeType) {
      case 'SELL': {
        quantityToUpdate = quantity + stockData.quantity
        userBalance = quantity * stockData.price
        updatedCurrencyData.dinero = userBalance + currencies.dinero
        stockPriceToBeUpdated = getUpdatedPrice(stockData.price)
        break
      }
      case 'BUY': {
        qtyUserCanPurchase = Math.floor(totalPrice / stockData.price)
        if (qtyUserCanPurchase <= 0 || totalPrice > currencies.dinero) {
          return { canUserTrade: false, errorMessage: INSUFFICIENT_FUNDS }
        }
        orderValue = qtyUserCanPurchase * stockData.price
        quantityToUpdate = stockData.quantity - qtyUserCanPurchase
        userBalance = currencies.dinero - orderValue
        updatedCurrencyData.dinero = userBalance
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
      userId: userId,
      stockName: stockData.name,
      orderValue,
      quantity: qtyUserCanPurchase,
      price: stockData.price,
      timestamp: +Date.now()
    })

    await transactionsModel.add({
      userId: userId,
      type: `STOCK_${tradeType}`,
      refId: id,
      timestamp: +Date.now()
    })

    // update user wallet

    updateWallet(userId, {
      ...currencies,
      ...updatedCurrencyData
    })

    await stocksModel.doc(stockId).set(updatedStockData)
    return { userBalance, canUserTrade: true }
  } catch (err) {
    logger.error('Error in trading', err)
    throw err
  }
}

module.exports = {
  trade
}
