const express = require('express')
const router = express.Router()
const exchangeController = require('../controllers/exchangeController')

router.get('/rates', exchangeController.getExchangeRate)

router.post('/rates', exchangeController.createExchangeRate)

router.get('/banks', exchangeController.getAllBanksName)

router.get('/:bankId', exchangeController.getCurrencyAvailability)

router.patch('/', exchangeController.convertCurrency)

module.exports = router
