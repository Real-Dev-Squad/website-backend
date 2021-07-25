const joi = require('joi')

const validateFeatureFlag = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    name: joi.string().required(),
    title: joi.string().required(),
    created_at: joi.number().optional(),
    updated_at: joi.number().optional(),
    config: joi.object({
      enabled: joi.boolean().required()
    }).required(),
    launched_at: joi.number().optional()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error in validating featureFlag data: ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const updateFeatureFlags = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    title: joi.string().optional(),
    config: joi.object({
      enabled: joi.boolean().required()
    }).required()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error in validating featureFlag data: ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  validateFeatureFlag,
  updateFeatureFlags
}
