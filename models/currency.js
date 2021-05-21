const firestore = require('../utils/firestore')
const walletModel = firestore.collection('wallets')
const bankModel = firestore.collection('banks')
const currencyExchangeModel = firestore.collection('currencyExchange')
const transactionModel = firestore.collection('transactions')
const { extractReferenceDocumentData, extractReferenceDocumentId } = require('../utils/firestore-helper')

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
      lastUpdate: Date.now()
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
 * Rounds number to 2 precision after decimal point
 * @return {Promise<object>}
 */
const roundToTwoDigits = (num) => {
  return Math.round(num * 100) / 100
}

/**
 * Update bank currecy after excbange
 * @return {Promise<exchangeData>}
 */
const updateBankWalletAfterExchange = (bankCurrency, exchangeData, totalTargetCurrencyRequest) => {
  bankCurrency[exchangeData.src] = roundToTwoDigits((bankCurrency[exchangeData.src] || 0) + parseFloat(exchangeData.quantity))
  bankCurrency[exchangeData.target] = roundToTwoDigits(bankCurrency[exchangeData.target] - totalTargetCurrencyRequest)
  return { ...bankCurrency }
}

/**
 * Update user currecy after excbange
 * @return {Promise<exchangeData>}
 */
const updateUserWalletAfterExchange = (userCurrency, exchangeData, totalTargetCurrencyRequest) => {
  userCurrency[exchangeData.target] = roundToTwoDigits((userCurrency[exchangeData.target] || 0) + parseFloat(totalTargetCurrencyRequest))
  userCurrency[exchangeData.src] = roundToTwoDigits(userCurrency[exchangeData.src] - exchangeData.quantity)
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
    const userWalletRef = walletModel.where('userId', '==', userId).limit(1)
    const bankWalletRef = bankModel.where('bankId', '==', bankId).limit(1)
    const exchangeRateRef = currencyExchangeModel.doc(allCurrencyName)
    const exchangeResponse = await firestore.runTransaction(async t => {
      const responseObj = {
        status: false,
        message: ''
      }

      const userWalletDoc = await t.get(userWalletRef)
      const userWalletId = await extractReferenceDocumentId(userWalletDoc)
      const userWallet = await extractReferenceDocumentData(userWalletDoc)
      const bankWalletDoc = await t.get(bankWalletRef)
      const bankWalletId = await extractReferenceDocumentId(bankWalletDoc)
      const bankWallet = await extractReferenceDocumentData(bankWalletDoc)
      if (bankWallet && bankWallet.isActive) {
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
          responseObj.status = true
          responseObj.message = 'Transaction Successful'
        } else {
          responseObj.message = 'Insufficient funds'
        }
      } else {
        responseObj.message = 'Bank not found or it is inactive'
      }
      return responseObj
    })
    transactionModel.add({
      bankId,
      userId,
      timestamp: Date.now(),
      status: (exchangeResponse.status) ? 'success' : 'failed',
      message: exchangeResponse.message,
      ...exchangeData
    })
    // t.set(transactionDocument,)
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
