const joi = require('joi')

class MemberValidator {
  async createMember (req, res, next) {
    const schema = joi.object().keys({
      id: joi.string().required(),
      first_name: joi.string().required(),
      last_name: joi.string().required(),
      yoe: joi.number().optional(),
      company: joi.string().optional(),
      designation: joi.string().optional(),
      img: joi.string().optional(),
      github_id: joi.string().optional(),
      linkedin_id: joi.string().optional(),
      twitter_id: joi.string().optional(),
      instagram_id: joi.string().optional(),
      site: joi.string().optional()
    })

    try {
      await schema.validateAsync(req.body)
      next()
    } catch (error) {
      res.boom.badRequest(error.details[0].message)
    }
  }

  async updateMember (req, res, next) {
    const schema = joi.object().keys({
      id: joi.string().optional(),
      first_name: joi.string().optional(),
      last_name: joi.string().optional(),
      yoe: joi.number().optional(),
      company: joi.string().optional(),
      designation: joi.string().optional(),
      img: joi.string().optional(),
      github_id: joi.string().optional(),
      linkedin_id: joi.string().optional(),
      twitter_id: joi.string().optional(),
      instagram_id: joi.string().optional(),
      site: joi.string().optional()
    })
    try {
      await schema.validateAsync(req.body)
      next()
    } catch (error) {
      res.boom.badRequest(error.details[0].message)
    }
  }
};

module.exports = new MemberValidator()
