const joi = require('joi')

const createProduct = async (req, res, next) => {
  const schema = joi.object().keys({
    id: joi.string().required(),
    image: joi.string().required(),
    name: joi.string().required(),
    category: joi.string().required(),
    manufacturer: joi.string().required(),
    price: joi.number().required(),
    usage: joi.array().optional()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating product payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const purchaseTransaction = async (req, res, next) => {
  const schema = joi.object().keys({
    amount: joi.object().keys().required(),
    items: joi.array().items({
      itemId: joi.string().required(),
      name: joi.string().optional(),
      quantity: joi.number().required()
    }).required(),
    totalQuantity: joi.number()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating purchase payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  createProduct,
  purchaseTransaction
}
