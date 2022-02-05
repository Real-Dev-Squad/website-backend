// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'validateRe... Remove this comment to see the full error message
const validateRecruiter = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    company: joi.string().required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    designation: joi.string().required(),
    reason: joi.string().required(),
    email: joi.string().required(),
    currency: joi.string().required(),
    package: joi.number().optional()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error in validating recruiter data: ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  validateRecruiter
}
