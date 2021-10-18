const joi = require('joi')

const createAuction = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    item_type: joi.string().required(),
    quantity: joi.number().required(),
    initial_price: joi.number().required(),
    end_time: joi.number().required()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error creating auction : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const placeBid = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    bid: joi.number().required()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error creating auction : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  createAuction,
  placeBid
}
