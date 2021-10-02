const joi = require('joi')
const { userStatusEnum } = require('../../constants/users')

const updateUser = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    phone: joi.string().optional(),
    email: joi.string().optional(),
    yoe: joi.number().optional(),
    company: joi.string().optional(),
    designation: joi.string().optional(),
    linkedin_id: joi.string().optional(),
    twitter_id: joi.string().optional(),
    instagram_id: joi.string().optional(),
    website: joi.string().optional(),
    status: joi.any().valid(...userStatusEnum).optional()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating updateUser payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

module.exports = {
  updateUser
}
