/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const transactionsRef = firestore.collection('transaction')

/**
 * fetch latest 10 transactions from DB from specific userId provided
 * @param userId { String }: User Id String to be used to fetch latest transactions
 * @returns {Promise<{isUserExist: boolean, transactions: []}>}
 */
const fetchLatestTransactions = async (userId) => {
  const transactions = await transactionsRef.where('userId', '==', userId).get
  const res = []
  transactions.forEach((doc) => {
    const transaction = doc.data()
    transaction.dateInMillis = doc.data().dateTime._seconds * 1000
    delete transaction.dateTime
    res.push(transaction)
  })
  res.sort((a, b) => {
    return a.dateInMillis > b.dateInMillis ? 1 : -1
  })
  return res.slice(0, 10)
}

module.exports = {
  fetchLatestTransactions
}
