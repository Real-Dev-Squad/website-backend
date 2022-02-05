// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'validateFe... Remove this comment to see the full error message
const validateFeatureFlag = async (req: any, res: any, next: any) => {
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'updateFeat... Remove this comment to see the full error message
const updateFeatureFlags = async (req: any, res: any, next: any) => {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  validateFeatureFlag,
  updateFeatureFlags
}
