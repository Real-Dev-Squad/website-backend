const joi = require('joi')
const { loggers } = require('winston')

const createChallenge = async (req, res, next) => {
  const schema = joi.object.strict.keys({
    title: joi.string.required(),
    level: joi.string.required(),
    start_date: joi.string.required(),
    end_date: joi.string.required()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    loggers.error(`Error validating createChallenge payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  createChallenge
}
