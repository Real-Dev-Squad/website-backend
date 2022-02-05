const joi = require('joi')

const validateRecruiter = async (req, res, next) => {
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

module.exports = {
  validateRecruiter
}
