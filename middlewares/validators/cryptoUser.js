const joi = require('joi')
const logger = require('../../utils/logger')

const validateUser = async (req, res, next) => {
  const schema = joi.object().keys({
    coins: joi.number(),
    name: joi.string().optional(),
    notification: joi.string(),
    orders: joi.string().optional(),
    photo: joi.string().optional(),
    transaction: joi.string().optional(),
    user_id: joi.string().optional()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating validateUser payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  validateUser
}
