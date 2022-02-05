// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createChal... Remove this comment to see the full error message
const createChallenge = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    title: joi.string().required(),
    level: joi.string().required(),
    start_date: joi.number().required(),
    end_date: joi.number().required()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating createChallenge payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  createChallenge
}
