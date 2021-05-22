const joi = require('joi')
const { SUPPORTED_CURRENCIES } = require('../../constants/wallets')

const postCurrencyRates = async (req, res, next) => {
  const schema = joi.object().keys({
    src: joi.string().valid(...SUPPORTED_CURRENCIES).required(),
    target: joi.string().valid(...SUPPORTED_CURRENCIES).required(),
    quantity: joi.number().required()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error creating currency exchange rates : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const patchExchange = async (req, res, next) => {
  const schema = joi.object().keys({
    src: joi.string().valid(...SUPPORTED_CURRENCIES).required(),
    target: joi.string().valid(...SUPPORTED_CURRENCIES).required(),
    quantity: joi.number().required(),
    bankId: joi.string().required()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error exchange : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  patchExchange,
  postCurrencyRates
}
