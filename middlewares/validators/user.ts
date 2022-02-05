// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userStatus... Remove this comment to see the full error message
const { userStatusEnum } = require('../../constants/users')

const updateUser = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    phone: joi.string().optional(),
    email: joi.string().optional(),
    username: joi.string().optional(),
    first_name: joi.string().optional(),
    last_name: joi.string().optional(),
    yoe: joi.number().optional(),
    company: joi.string().optional(),
    designation: joi.string().optional(),
    img: joi.string().optional(),
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  updateUser
}
