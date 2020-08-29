const joi = require('joi')

class MemberValidator {
  async createMember (req, res, next) {
    const schema = joi.object().keys({
      id: joi.string().required(),
      first_name: joi.string().required(),
      last_name: joi.string().required(),
      yoe: joi.number().required(),
      company: joi.string().required(),
      designation: joi.string().required(),
      github_id: joi.string().optional(),
      linkedin_id: joi.string().optional(),
      twitter_id: joi.string().optional(),
      instagram_id: joi.string().optional()
    })

    try {
      const result = await joi.validate(req.body, schema)
      if (result) return next()
    } catch (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      })
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
      github_id: joi.string().optional(),
      linkedin_id: joi.string().optional(),
      twitter_id: joi.string().optional(),
      instagram_id: joi.string().optional()
    })
    try {
      const result = await joi.validate(req.body, schema)
      if (result) return next()
    } catch (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      })
    }
  }
};
module.exports = new MemberValidator()
