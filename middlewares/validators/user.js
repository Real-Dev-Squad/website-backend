const joi = require('joi')

const createUser = async (req, res, next) => {
  const schema = joi.object().keys({
    phone: joi.string().optional(),
    email: joi.string().optional(),
    company_name: joi.string().optional(),
    username: joi.string().optional(),
    first_name: joi.string().optional(),
    last_name: joi.string().optional(),
    yoe: joi.number().optional(),
    company: joi.string().optional(),
    designation: joi.string().optional(),
    img: joi.string().optional(),
    github_display_name: joi.string().optional(),
    github_id: joi.string().optional(),
    linkedin_id: joi.string().optional(),
    twitter_id: joi.string().optional(),
    instagram_id: joi.string().optional(),
    site: joi.string().optional(),
    isMember: joi.boolean().optional(),
    tokens: joi.object().optional(),
    website: joi.string().optional()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating createUser payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const updateUser = async (req, res, next) => {
  const schema = joi.object().keys({
    phone: joi.string().optional(),
    email: joi.string().optional(),
    company_name: joi.string().optional(),
    username: joi.string().optional(),
    first_name: joi.string().optional(),
    last_name: joi.string().optional(),
    yoe: joi.number().optional(),
    company: joi.string().optional(),
    designation: joi.string().optional(),
    img: joi.string().optional(),
    github_display_name: joi.string().optional(),
    github_id: joi.string().optional(),
    linkedin_id: joi.string().optional(),
    twitter_id: joi.string().optional(),
    instagram_id: joi.string().optional(),
    site: joi.string().optional(),
    isMember: joi.boolean().optional(),
    tokens: joi.object().optional(),
    website: joi.string().optional().allow('')
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
  createUser,
  updateUser
}
