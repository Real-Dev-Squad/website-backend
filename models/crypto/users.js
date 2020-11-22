/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const logger = require('../../utils/logger')
const firestore = require('../../utils/firestore')
const cryptoUsersModel = firestore.collection('crypto/users/details')
const cryptoTransaction = require('../../utils/cryptoTransaction')
/**
 * Fetches the data of a users in crypto site
 * @return {Promise<usersModel|Object>}
 */

const fetchUser = async (id) => {
  try {
    const user = await cryptoUsersModel.doc(id).get()
    if (user.exists) {
      return {
        user: {
          ...user.data()
        }
      }
    }
    return ''
  } catch (err) {
    logger.error('Error retrieving user data', err)
    throw err
  }
}

/**
 * Adds the data of a user to crypto site
 * @return {Promise<usersModel|Object>}
 */

const addUser = async (req) => {
  try {
    const id = req.params.id
    let userInfo = await cryptoUsersModel.where('id', '==', id).limit(1).get()

    if (userInfo.empty) {
      const userData = {
        id,
        firstName: req.userData.first_name,
        lastName: req.userData.last_name,
        coins: {
          copper: 1000,
          silver: 100,
          gold: 10
        },
        transactionsHistory: [],
        pendindTransactions: [],
        shoppingHistory: [],
        cart: []
      }

      userInfo = await cryptoUsersModel.doc(id).set(userData)
      return { userId: userInfo.id }
    }

    return ''
  } catch (err) {
    logger.error('Error adding user data', err)
    throw err
  }
}

/**
 * Updates transaction history of user in crypto
 * @return {Promise<usersModel|Object>}
 */

const updateTransactionHistory = async (id, data) => {
  try {
    let userInfo = await cryptoUsersModel.doc(id).get()
    if (userInfo.exists) {
      userInfo = userInfo.data()
      const updateValue = [...userInfo.transactionsHistory, data.transactionsHistory]
      userInfo = await cryptoUsersModel.doc(id).update({ transactionsHistory: updateValue })
      return { userId: userInfo.id }
    }

    return ''
  } catch (err) {
    logger.error('Error adding user data', err)
    throw err
  }
}

/**
 * Updates shopping history of user in crypto
 * @return {Promise<usersModel|Object>}
 */

const updateShoppingHistory = async (id, data) => {
  try {
    let userInfo = await cryptoUsersModel.doc(id).get()
    if (userInfo.exists) {
      userInfo = userInfo.data()
      const updateValue = [...userInfo.shoppingHistory, data.shoppingHistory]
      userInfo = await cryptoUsersModel.doc(id).update({ shoppingHistory: updateValue }, { merge: true })
      return { userId: userInfo.id }
    }

    return ''
  } catch (err) {
    logger.error('Error adding user data', err)
    throw err
  }
}

/**
 * Updates cart of user in crypto
 * @return {Promise<usersModel|Object>}
 */

const updateCart = async (id, data) => {
  try {
    let userInfo = await cryptoUsersModel.doc(id).get()
    if (userInfo.exists) {
      userInfo = await cryptoUsersModel.doc(id).update({ cart: data.cart }, { merge: true })
      return { userId: userInfo.id }
    }

    return ''
  } catch (err) {
    logger.error('Error adding user data', err)
    throw err
  }
}

/**
 * Send coins to user in crypto
 * @return {Promise<usersModel|Object>}
 */

const sendCoins = async (id, receiverData) => {
  try {
    const userInfo = await cryptoUsersModel.doc(id).get()
    if (!userInfo.exists) return ''
    const payer = userInfo.data()
    if (cryptoTransaction.isBalanceSufficient(payer.coins, receiverData.coins)) {
      const receiver = await cryptoUsersModel.doc(receiverData.id).get()
      if (!receiver.exists) return ''
      const { payerCoins, receiverCoins } = cryptoTransaction.updateBalance(payer.coins, receiver.data().coins, receiverData.coins)
      await cryptoUsersModel.doc(payer.id).update({ coins: payerCoins }, { merge: true })
      await cryptoUsersModel.doc(receiver.id).update({ coins: receiverCoins }, { merge: true })
      return { message: 'Transaction Successful' }
    }
    return { message: 'Insifficient funds' }
  } catch (err) {
    logger.error('Error adding user data', err)
    throw err
  }
}

/**
 * Receive coins to user in crypto
 * @return {Promise<usersModel|Object>}
 */

const receiveCoins = async (id, data) => {
  try {
    const userInfo = await cryptoUsersModel.doc(id).get()
    if (!userInfo.exists) return ''
    const requestObj = {
      id,
      mode: data.mode,
      coins: data.coins,
      message: data.message || ''
    }
    const requestUser = await cryptoUsersModel.doc(data.id).get()
    if (!requestUser.exists) return ''
    const requestUserData = requestUser.data()
    const updatePendingTransaction = [...requestUserData.pendindTransactions, requestObj]
    await cryptoUsersModel.doc(data.id).update({ pendindTransactions: updatePendingTransaction }, { merge: true })
    return { message: `Request to ${data.id} user made successfull` }
  } catch (err) {
    logger.error('Error adding user data', err)
    throw err
  }
}

module.exports = {
  fetchUser,
  addUser,
  updateTransactionHistory,
  updateShoppingHistory,
  updateCart,
  sendCoins,
  receiveCoins
}
