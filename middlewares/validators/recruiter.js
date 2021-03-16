const joi = require('joi')

const validateRecruiter = async (req, res, next) => {
  const schema = joi.object().keys({
    company: joi.string().optional(),
    first_name: joi.string().optional(),
    last_name: joi.string().optional(),
    designation: joi.string().optional(),
    reason: joi.string().optional(),
    email: joi.string().optional(),
    currency: joi.string().optional(),
    package: joi.number().optional(),
    timestamp: joi.string().optional()
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
