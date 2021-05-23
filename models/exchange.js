const firestore = require('../utils/firestore')
const { extractReferenceDocumentData, extractReferenceDocumentId } = require('../utils/firestore-helper')
const { roundToTwoDigits } = require('../utils/math-helpers')
const { WALLETS, BANKS, CURRENCY_EXCHANGE, TRANSACTIONS } = require('../constants/firestore-collections')
const { ALL_CURRENCY_EXCHANGE_DOCUMENT_NAME: allCurrencyName } = require('../constants/currency-exchange')
const walletModel = firestore.collection(WALLETS)
const bankModel = firestore.collection(BANKS)
const currencyExchangeModel = firestore.collection(CURRENCY_EXCHANGE)
const transactionModel = firestore.collection(TRANSACTIONS)

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
 * @param bankId { String }
 * @return {Promise<exchangeData>}
 */
const fetchCurrencyAvailablity = async (bankId) => {
  try {
    const bankSnapshot = await bankModel.where('bankId', '==', bankId).limit(1).get()
    if (!bankSnapshot.empty) {
      const bank = (bankSnapshot.docs[0] && (bankSnapshot.docs[0].data()))
      if (bank.isActive) {
        return bank.currencies
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
 * @param currencyData { Object }
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
      const { bankId, bankName, isActive } = bank.data()
      if (isActive) {
        bankData.push({ bankId, bankName })
      }
    })
    return bankData
  } catch (err) {
    logger.error('Error while getting bank detais', err)
    throw err
  }
}

/**
 * Checks if currency requested for exchange is available in bank and with user
 * @param bank { Object }: Bank currency details
 * @param user { Object }: User currency details
 * @param exchangeData { Object }
 * @return {Boolean}
 */
const checkIfCurrenyTypeAvailable = (bank, user, exchangeData) => {
  const currencyStatus = {}
  const { src, target } = exchangeData
  const { currencies: bankCurrency } = bank
  const { currencies: userCurrency } = user
  currencyStatus.bank = Object.hasOwnProperty.call(bankCurrency, target)
  currencyStatus.user = Object.hasOwnProperty.call(userCurrency, src)
  return currencyStatus
}

/**
 * Update bank currecy after excbange
 * @param bankCurrency { Object }: Bank's available currency
 * @param exchangeData { Object }: Requested currency
 * @param totalTargetCurrencyRequest { Number }: Total request amount for exchange
 * @return {Promise<exchangeData>}
 */
const updateBankWalletAfterExchange = (bankCurrency, exchangeData, totalTargetCurrencyRequest) => {
  bankCurrency[exchangeData.src] = roundToTwoDigits((bankCurrency[exchangeData.src] || 0) + parseFloat(exchangeData.quantity))
  bankCurrency[exchangeData.target] = roundToTwoDigits(bankCurrency[exchangeData.target] - totalTargetCurrencyRequest)
  return { ...bankCurrency }
}

/**
 * Update user currecy after excbange
 * @param userCurrency { Object }: User's available currency
 * @param exchangeData { Object }: Requested currency
 * @param totalTargetCurrencyRequest { Number }: Total request amount for exchange
 * @return {Promise<exchangeData>}
 */
const updateUserWalletAfterExchange = (userCurrency, exchangeData, totalTargetCurrencyRequest) => {
  userCurrency[exchangeData.target] = roundToTwoDigits((userCurrency[exchangeData.target] || 0) + parseFloat(totalTargetCurrencyRequest))
  userCurrency[exchangeData.src] = roundToTwoDigits(userCurrency[exchangeData.src] - exchangeData.quantity)
  return { ...userCurrency }
}

/**
 * Transaction for currency exchange
 * @param userId { String }
 * @param exchangeData { Object }
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

      const [userWalletDoc, bankWalletDoc] = await Promise.all([t.get(userWalletRef), t.get(bankWalletRef)])
      const userWalletId = await extractReferenceDocumentId(userWalletDoc)
      const userWallet = await extractReferenceDocumentData(userWalletDoc)
      const bankWalletId = await extractReferenceDocumentId(bankWalletDoc)
      const bankWallet = await extractReferenceDocumentData(bankWalletDoc)
      const currencyStatus = checkIfCurrenyTypeAvailable(bankWallet, userWallet, exchangeData)
      if (currencyStatus.bank && currencyStatus.user) {
        if (bankWallet && bankWallet.isActive) {
          const exchangeRates = (await t.get(exchangeRateRef)).data()
          const srcExchangeRate = exchangeRates[exchangeData.src][exchangeData.target]
          const totalTargetCurrencyRequest = (srcExchangeRate * exchangeData.quantity)
          const userFunds = userWallet.currencies[exchangeData.src] >= exchangeData.quantity
          const bankFunds = bankWallet.currencies[exchangeData.target] >= totalTargetCurrencyRequest
          if (userFunds && bankFunds) {
            // Update bank currency
            const bankWalletAfterExchange = updateBankWalletAfterExchange(bankWallet.currencies, exchangeData, totalTargetCurrencyRequest)
            const userWalletAfterExchange = updateUserWalletAfterExchange(userWallet.currencies, exchangeData, totalTargetCurrencyRequest)
            const bankWalletUpdateRef = bankModel.doc(bankWalletId)
            const userWalletUpdateRef = walletModel.doc(userWalletId)
            await Promise.all(
              [
                t.update(bankWalletUpdateRef, { currencies: bankWalletAfterExchange }),
                t.update(userWalletUpdateRef, { currencies: userWalletAfterExchange })
              ])
            responseObj.status = true
            responseObj.message = 'Transaction Successful!'
          } else {
            const insufficientFundsWith = !(bankFunds && userFunds) ? 'bank and user' : (!bankFunds) ? 'bank' : (!userFunds) ? 'user' : ''
            responseObj.message = `Insufficient funds with ${(insufficientFundsWith)}`
          }
        } else {
          responseObj.message = 'Bank not found or it is inactive'
        }
      } else {
        const { bank, user } = currencyStatus
        const notSupportedBy = (bank) ? 'bank' : (user) ? 'user' : 'bank and user'
        responseObj.message = `Transaction currency type not supported by ${notSupportedBy}`
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
