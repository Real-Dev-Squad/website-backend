const joi = require('joi')
const logger = require('../../utils/logger')

const createUser = async (req, res, next) => {
  const schema = joi.object().keys({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
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
    tokens: joi.object().optional()
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
    tokens: joi.object().optional()
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
