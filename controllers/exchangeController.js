const { fetchExchangeRates, fetchCurrencyAvailablity, getAllBanks, updateBankAndUserWallet, createCurrencyRates } = require('../models/currency')

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getExchangeRate = async (req, res) => {
  const exchangeRates = await fetchExchangeRates()
  return res.json({
    data: exchangeRates
  })
}

const createExchangeRate = (req, res) => {
  const currencyData = { ...req.body, timestamp: Date.now() }
  createCurrencyRates(currencyData)
  return res.json({
    message: 'currency created successfully!',
    banks: currencyData
  })
}

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getCurrencyAvailability = async (req, res) => {
  const bankId = req.params.bankId
  const currencyData = await fetchCurrencyAvailablity(bankId)
  console.log('currencyData');
  console.log(currencyData);
  return res.json({
    message: 'currency returned successfully!',
    banks: currencyData
  })
}

const getAllBanksName = async (req, res) => {
  try {
    const bankData = await getAllBanks()
    if (bankData) {
      return res.json({
        message: 'Bank returned successfully!',
        banks: bankData
      })
    } else {
      return res.status(428).json({
        status: 'failed',
        message: 'Something went wrong. Call Prakash!'
      })
    }
  } catch (err) {
    logger.error(`Error while fetching all users: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

const convertCurrency = async (req, res) => {
  try {
    console.log(req)
    const exchangeTransactionStatus = await updateBankAndUserWallet(req.body.userId, req.body)
    if (exchangeTransactionStatus) {
      return res.status(200).json({ // TODO update status
        status: 'success'
      })
    } else {
      return res.status(428).json({ // TODO update status
        status: 'failed',
        message: 'Something went wrong. Call Prakash!'
      })
    }
  } catch (err) {
    logger.error(`Error while fetching all users: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getExchangeRate,
  getCurrencyAvailability,
  getAllBanksName,
  convertCurrency,
  createExchangeRate
}
