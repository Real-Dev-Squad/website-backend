/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require("../utils/firestore");
const transactionsModel = firestore.collection("transaction");

/**
 * fetch latest N transactions from transactions collection for specific userid provided
 *
 * @param userId { String }: User Id String to be used to fetch latest transactions
 * @param n { number }: no of records to fetch from transaction table, if not specified in URL then default will be 10
 * @param o { String }: to order the transactions in ascending or descending manner, by default will fetch latest first
 * @returns {Promise<{transactions: []}>}
 */
const fetch = async (userId, n, o = "DESC") => {
  const transactionsRef = await transactionsModel.where("userId", "==", userId).get();
  const transactions = [];
  transactionsRef.forEach((doc) => {
    const transaction = doc.data();
    transaction.dateInMillis = doc.data().dateTime._seconds * 1000;
    delete transaction.dateTime;
    transactions.push(transaction);
  });
  transactions.sort((a, b) => {
    return o === "DESC" ? (a.dateInMillis > b.dateInMillis ? -1 : 1) : a.dateInMillis > b.dateInMillis ? 1 : -1;
  });
  return transactions.slice(0, n || 10);
};

module.exports = {
  fetch,
};
