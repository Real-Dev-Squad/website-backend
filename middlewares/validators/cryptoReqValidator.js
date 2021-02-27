const joi = require('joi')

const send = async (req, res, next) => {
  const schema = joi.object().keys({
    to: joi.string(),
    from: joi.string(),
    amount: joi.number(),
    currency: joi.string()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating send payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const receive = async (req, res, next) => {
  const schema = joi.object().keys({
    to: joi.string(),
    from: joi.string(),
    amount: joi.number(),
    currency: joi.string()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating receive payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const approve = async (req, res, next) => {
  const schema = joi.object().keys({
    notification: joi.string(),
    userName: joi.string()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating approve payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  send,
  receive,
  approve
}
