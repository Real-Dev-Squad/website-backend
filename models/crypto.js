/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const walletModel = firestore.collection('Wallet')
const transactionModel = firestore.collection('Transaction')
const notificationModel = firestore.collection('Notification')

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
const updateWallet = async (from) => {
  try {
    let id, userData
    const userId = from.user.userId
    const currency = from.user.currency
    const user = await walletModel.where('userId', '==', userId).get()
    user.forEach(doc => {
      id = doc.id
      userData = doc.data()
    })
    if (userData) {
      await walletModel.doc(id).update({
        currency
      })
    }
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
const notification = async (message, userId) => {
  try {
    const messageToBeNotified = message.split(' ')
    let typeOfNotification = ''
    if (messageToBeNotified[3] === 'Requested') {
      typeOfNotification = 'Credit Request'
    }
    const date = new Date()
    const Status = true
    await notificationModel.doc(userId).set({
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
    if (transactionId) {
      transactionId = count
      count++
    }
    const data = message.split(' ')
    let [amount, currency, typeOfTransaction, userId, userTo] = [data[0], data[1], data[3], data[5], data[(data.length) - 2]]
    if (typeOfTransaction === 'Creditted') {
      typeOfTransaction = 'credit'
    } else {
      typeOfTransaction = 'debit'
    }
    await transactionModel.doc(userId).set({
      amount, currency, transactionId, typeOfTransaction, userTo, userId
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
