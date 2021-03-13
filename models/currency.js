const firestore = require('../utils/firestore')
const walletModel = firestore.collection('wallets')
const bankModel = firestore.collection('banks')
const currencyExchangeModel = firestore.collection('currencyExchange')
// const transactionModel = firestore.collection('transaction')

const allCurrencyName = 'allCurrencies'
/**
 * Fetches the data about our badges
 * @param query { Object }: Filter for badges data
 * @return {Promise<badgeModel|Array>}
 */

const fetchExchangeRates = async () => {
  try {
    const exchangeSnapshot = await currencyExchangeModel.doc(allCurrencyName).get()
    if (exchangeSnapshot.exists) {
      return exchangeSnapshot.data()
    }
    return undefined
  } catch (err) {
    return err
  }
}

const fetchCurrencyAvailablity = async (bankId) => {
  try {
    const bankSnapshot = await bankModel.where('bankId', '==', bankId).limit(1).get()
    if (!bankSnapshot.empty) {
      return (bankSnapshot.docs[0] && (bankSnapshot.docs[0].data()))
    }
    return undefined
  } catch (err) {
    return err
  }
}

const createCurrencyRates = async (currencyData) => {
  try {
    await currencyExchangeModel.add(currencyData)
    await currencyExchangeModel.doc(allCurrencyName).update({
      [currencyData.to]: {
        [currencyData.from]: currencyData.value
      }
    })
    return true
  } catch (err) {
    return err
  }
}

const getAllBanks = async () => {
  try {
    const bankSnapshot = await bankModel.get()
    const bankData = []
    bankSnapshot.forEach(bank => {
      const data = bank.data()
      bankData.push({ bankId: data.bankId, bankName: data.bankName })
    })
    return bankData
  } catch (err) {
    return err
  }
}

const updateBankAndUserWallet = async (userId, reqBody) => {
  try {
    return bankData
  } catch (err) {
    return err
  }
}

module.exports = {
  fetchExchangeRates,
  fetchCurrencyAvailablity,
  getAllBanks,
  updateBankAndUserWallet,
  createCurrencyRates
}
