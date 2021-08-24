const joi = require('joi')

const newTrade = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    stockId: joi.string().required(),
    tradeType: joi.string().required(),
    stockName: joi.string().required(),
    quantity: joi.number().required(),
    listedPrice: joi.number().required(),
    totalPrice: joi.number().required()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating newTrade payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  newTrade
}
