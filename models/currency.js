const firestore = require('../utils/firestore')
const walletModel = firestore.collection('wallets')
const bankModel = firestore.collection('banks')
const currencyExchangeModel = firestore.collection('currencyExchange')
// const transactionModel = firestore.collection('transactions')

const allCurrencyName = 'allCurrencies'

/**
 * Fetch the currency exchange rates
 * @return {Promise<exchangeData>}
 */
const fetchExchangeRates = async () => {
  try {
    const exchangeSnapshot = await currencyExchangeModel.doc(allCurrencyName).get()
    if (exchangeSnapshot.exists) {
      return exchangeSnapshot.data()
    }
    return undefined
  } catch (err) {
    logger.error('Error while getting currency rates from exchange', err)
    throw err
  }
}

/**
 * Fetch the currency exchange from the bank
 * @return {Promise<exchangeData>}
 */
const fetchCurrencyAvailablity = async (bankId) => {
  try {
    const bankSnapshot = await bankModel.where('bankId', '==', bankId).limit(1).get()
    if (!bankSnapshot.empty) {
      const bank = (bankSnapshot.docs[0] && (bankSnapshot.docs[0].data()))
      if (bank.isActive) {
        return bank.currency
      }
    }
    return undefined
  } catch (err) {
    logger.error('Error while getting currency data from bank', err)
    throw err
  }
}

/**
 * Sets the currency exchange rates
 * @return {Promise<exchangeData>}
 */
const createCurrencyRates = async (currencyData) => {
  try {
    await currencyExchangeModel.add(currencyData)
    await currencyExchangeModel.doc(allCurrencyName).set({
      [currencyData.src]: {
        [currencyData.target]: currencyData.quantity
      },
      lastUpdate: new Date()
    }, {
      merge: true
    })
    return true
  } catch (err) {
    logger.error('Error while adding currency rates into exchange', err)
    throw err
  }
}

/**
 * Fetch the all banks availabe name and id
 * @return {Promise<exchangeData>}
 */
const getAllBanks = async () => {
  try {
    const bankSnapshot = await bankModel.get()
    const bankData = []
    bankSnapshot.forEach(bank => {
      const data = bank.data()
      if (data.isActive) {
        bankData.push({ bankId: data.bankId, bankName: data.bankName })
      }
    })
    return bankData
  } catch (err) {
    logger.error('Error while getting bank detais', err)
    throw err
  }
}

/**
 * Extracts the data form the first doc of firestore response
 * @return {Promise<object>}
 */
const extractRefDocsData = (doc) => {
  return doc.docs[0] && doc.docs[0].data()
}

/**
 * Gets the id of firestore document
 * @return {Promise<object>}
 */
const extractRefDocsId = (doc) => {
  return doc.docs[0] && doc.docs[0].id
}

/**
 * Update bank currecy after excbange
 * @return {Promise<exchangeData>}
 */
const updateBankWalletAfterExchange = (bankCurrency, exchangeData, totalTargetCurrencyRequest) => {
  bankCurrency[exchangeData.src] = (bankCurrency[exchangeData.src] || 0) + parseInt(exchangeData.quantity)
  bankCurrency[exchangeData.target] -= totalTargetCurrencyRequest
  return { ...bankCurrency }
}

/**
 * Update user currecy after excbange
 * @return {Promise<exchangeData>}
 */
const updateUserWalletAfterExchange = (userCurrency, exchangeData, totalTargetCurrencyRequest) => {
  userCurrency[exchangeData.target] = (userCurrency[exchangeData.target] || 0) + parseInt(totalTargetCurrencyRequest)
  userCurrency[exchangeData.src] -= exchangeData.quantity
  return { ...userCurrency }
}

/**
 * Transaction for currency exchange
 * @return {Promise<exchangeData>}
 */
const exchangeTransaction = async (userId, exchangeData) => {
  try {
    const { bankId } = exchangeData
    // db models refs
    const userWalletRef = await walletModel.where('userId', '==', userId).limit(1)
    const bankWalletRef = await bankModel.where('bankId', '==', bankId).limit(1)
    const exchangeRateRef = await currencyExchangeModel.doc(allCurrencyName)
    const exchangeResponse = await firestore.runTransaction(async t => {
      const responseObj = {
        status: false,
        message: ''
      }

      const userWalletDoc = await t.get(userWalletRef)
      const userWalletId = await extractRefDocsId(userWalletDoc)
      const userWallet = await extractRefDocsData(userWalletDoc)
      const bankWalletDoc = await t.get(bankWalletRef)
      const bankWalletId = await extractRefDocsId(bankWalletDoc)
      const bankWallet = await extractRefDocsData(bankWalletDoc)

      if (bankWallet?.isActive) {
        const exchangeRates = (await t.get(exchangeRateRef)).data()
        const srcExchangeRate = exchangeRates[exchangeData.src][exchangeData.target]
        const totalTargetCurrencyRequest = (srcExchangeRate * exchangeData.quantity)
        if (userWallet.currency[exchangeData.src] >= exchangeData.quantity &&
          bankWallet.currency[exchangeData.target] >= totalTargetCurrencyRequest) {
          // Update bank currency
          const bankWalletAfterExchange = updateBankWalletAfterExchange(bankWallet.currency, exchangeData, totalTargetCurrencyRequest)
          const userWalletAfterExchange = updateUserWalletAfterExchange(userWallet.currency, exchangeData, totalTargetCurrencyRequest)
          // update Bank wallet currency
          const bankWalletUpdateRef = bankModel.doc(bankWalletId)
          t.update(bankWalletUpdateRef, { currency: bankWalletAfterExchange })
          // update User wallet currency
          const userWalletUpdateRef = walletModel.doc(userWalletId)
          t.update(userWalletUpdateRef, { currency: userWalletAfterExchange })
          // Log in Tranaction collection
          responseObj.status = true
          responseObj.message = 'Transaction Successful'
          // TODO: if required update transaction
        } else {
          responseObj.message = 'Insufficient funds'
        }
      } else {
        responseObj.message = 'Bank not found or it is inactive'
      }
      return responseObj
    })
    return exchangeResponse
  } catch (err) {
    logger.error('Error while exchanging currency data', err)
    throw err
  }
}

module.exports = {
  fetchExchangeRates,
  fetchCurrencyAvailablity,
  getAllBanks,
  exchangeTransaction,
  createCurrencyRates
}
