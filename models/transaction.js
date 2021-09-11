/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const transactionsModel = firestore.collection('transaction')

/**
 * fetch latest N transactions from transactions collection for specific userid provided
 *
 * @param userId { String }: User Id String to be used to fetch latest transactions
 * @param limit { number }: no of records to fetch from transaction table, if not specified in URL then default will be 10
 * @param offset { number }: starting index of set of records, default value is 0, useful for pagination
 * @param orderBy { String }: to order the transactions in ascending or descending manner, by default will fetch latest first
 * @returns {Promise<{transactions: []}>}
 */
const fetchTransactionsByUserId = async (userId, offset, limit, orderBy) => {
  try {
    const transactionsRef = await transactionsModel.where('userId', '==', userId).get()
    if (transactionsRef.exists) {
      const transactions = []
      transactionsRef.forEach((doc) => {
        const transaction = doc.data()
        transactions.push(transaction)
      })
      transactions.sort((a, b) => {
        return orderBy === 'DESC' ? (a.dateTime > b.dateTime ? -1 : 1) : a.dateTime > b.dateTime ? 1 : -1
      })
      return transactions.slice(offset, limit)
    } else {
      return logger.error('No matching documents.')
    }
  } catch (err) {
    return logger.error(`Error while processing transactions fetch request: ${err}`)
  }
}
module.exports = {
  fetchTransactionsByUserId
}
