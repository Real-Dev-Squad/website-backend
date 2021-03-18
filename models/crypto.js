/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */
const firestore = require('../utils/firestore')
const walletModel = firestore.collection('Wallet')
const transactionModel = firestore.collection('Transaction')
const notificationModel = firestore.collection('Notification')
const calculation = require('../middlewares/cryptoTransactionCalc')

/**
 * Fetches the data about our members
 * @return {Promise<userModel|Array>}
 */

/**
 * Fetches the user data from the the provided username or userId
 *
 * @param { Object }: Object with username and userId, any of the two can be used
 * @return {Promise<{userExists: boolean, user: <userModel>}|{userExists: boolean, user: <userModel>}>}
 */
const fetchUserWallet = async (userId) => {
  try {
    let userData, id
    if (userId) {
      const user = await walletModel.where('userId', '==', userId).get()
      user.forEach(doc => {
        id = doc.id
        userData = doc.data()
      })
    }
    return {
      userExists: !!userData,
      user: {
        id,
        ...userData,
        tokens: undefined
      }
    }
  } catch (err) {
    logger.error('Error retrieving user data', err)
    return err
  }
}

/**
 * Fetches the user data from the the provided username or userId
 *
 * @param { Object }: Object with username and userId, any of the two can be used
 * @return {Promise<{userExists: boolean, user: <userModel>}|{userExists: boolean, user: <userModel>}>}
 */
const updateWallet = async ({ fromUserWallet, toUserWallet, currencyType, amount }) => {
  try {
    const fromUserId = fromUserWallet.user.id
    const toUserId = toUserWallet.user.id
    const fromDoc = walletModel.doc(fromUserId)
    const toDoc = walletModel.doc(toUserId)
    await firestore.runTransaction(async (t) => {
      const result = calculation.cryptoCalc(fromUserWallet, toUserWallet, currencyType, amount)
      const updateFromCurrency = result.fromUserWallet.user.currency
      const updateToCurrency = result.toUserWallet.user.currency
      await t.update(fromDoc, { currency: updateFromCurrency })
      await t.update(toDoc, { currency: updateToCurrency })
    })
    return {
      message: 'success'
    }
  } catch (err) {
    logger.error('Error retrieving user data', err)
    return err
  }
}

/**
 * Fetches the user data from the the provided username or userId
 *
 * @param { Object }: Object with username and userId, any of the two can be used
 * @return {Promise<{userExists: boolean, user: <userModel>}|{userExists: boolean, user: <userModel>}>}
 */
const notification = async (message, userId, typeOfNotification) => {
  try {
    const date = new Date()
    const Status = false
    await notificationModel.add({
      message, userId, date, Status, typeOfNotification
    })
    return {
      message: 'success'
    }
  } catch (err) {
    logger.error('Error retrieving user data', err)
    return err
  }
}

/**
 * Fetches the user data from the the provided username or userId
 *
 * @param { Object }: Object with username and userId, any of the two can be used
 * @return {Promise<{userExists: boolean, user: <userModel>}|{userExists: boolean, user: <userModel>}>}
 */
const updateTransaction = async (message) => {
  try {
    let count = 0
    let transactionId = 0
    const date = new Date()
    const dateTime = date
    if (transactionId) {
      transactionId = count
      count++
    }
    const data = message.split(' ')
    let [amount, currency, type, userId, userTo] = [data[0], data[1], data[3], data[5], data[(data.length) - 2]]
    if (type === 'Creditted') {
      type = 'credit'
    } else {
      type = 'debit'
    }
    await transactionModel.add({
      amount, currency, transactionId, type, userTo, userId, dateTime
    })
    return {
      message: 'success'
    }
  } catch (err) {
    logger.error('Error retrieving user data', err)
    return err
  }
}
module.exports = {
  fetchUserWallet,
  updateWallet,
  updateTransaction,
  notification
}
