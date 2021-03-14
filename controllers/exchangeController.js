const { fetchExchangeRates, fetchCurrencyAvailablity, getAllBanks, exchangeTransaction, createCurrencyRates } = require('../models/currency')

/**
 * Get the challenges or add the challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getExchangeRate = async (req, res) => {
  try {
    const exchangeRates = await fetchExchangeRates()
    return res.json({
      data: exchangeRates
    })
  } catch (err) {
    logger.error(`Error while fetching exchange currency rates${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Get the challenges or add the challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createExchangeRate = (req, res) => {
  try {
    const { username } = req.userData
    // This id temperory hack, to make ankuhs set the exchange rate
    if (username === 'ankush') {
      const currencyData = { ...req.body, timestamp: new Date() }
      createCurrencyRates(currencyData)
      return res.json({
        message: 'currency created successfully!',
        banks: currencyData
      })
    }
    return res.boom.unauthorized('You are not authorized to use this, only ankush can XD')
  } catch (err) {
    logger.error(`Error while creating new exchange rate: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Get the challenges or add the challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrencyAvailabeInBank = async (req, res) => {
  try {
    const bankId = req.params.bankId
    const currencyData = await fetchCurrencyAvailablity(bankId)
    if (currencyData) {
      return res.json({
        message: 'currency returned successfully!',
        currency: currencyData
      })
    }
    return res.boom.notFound('Bank does not exists or it is not availablle at the moment')
  } catch (err) {
    logger.error(`Error while currency data from bank: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Get the challenges or add the challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBanksName = async (req, res) => {
  try {
    const bankData = await getAllBanks()
    return res.json({
      message: 'Bank returned successfully!',
      banks: bankData
    })
  } catch (err) {
    logger.error(`Error while fetching all users: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Get the challenges or add the challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const convertCurrency = async (req, res) => {
  try {
    const exchangeData = req.body
    const { id: userId } = req.userData
    const exchangeTransactionStatus = await exchangeTransaction(userId, exchangeData)
    return res.status(200).json({
      status: (exchangeTransactionStatus.status) ? 'success' : 'failure',
      message: exchangeTransactionStatus.message
    })
  } catch (err) {
    logger.error(`Error while fetching all users: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getExchangeRate,
  getCurrencyAvailabeInBank,
  getAllBanksName,
  convertCurrency,
  createExchangeRate
}
