/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const transactionsModel = firestore.collection('transaction')

/**
 * fetch latest 10 transactions from DB from specific userId provided
 * @param userId { String }: User Id String to be used to fetch latest transactions
 * @param noOfRecords { String }: no of records to fetch from transaction table
 * @returns {Promise<{isUserExist: boolean, transactions: []}>}
 */
const fetchLatest = async (userId, noOfRecords) => {
  const transactionsRef = await transactionsModel.where('userId', '==', userId).get()
  const transactions = []
  transactionsRef.forEach((doc) => {
    const transaction = doc.data()
    transaction.dateInMillis = doc.data().dateTime._seconds * 1000
    delete transaction.dateTime
    transactions.push(transaction)
  })
  transactions.sort((a, b) => {
    return a.dateInMillis > b.dateInMillis ? -1 : 1
  })
  return transactions.slice(0, noOfRecords)
}

module.exports = {
  fetchLatest
}
