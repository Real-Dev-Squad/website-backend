// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createStoc... Remove this comment to see the full error message
const createStock = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    name: joi.string().required(),
    quantity: joi.number().required(),
    price: joi.number().required()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating createStock payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  createStock
}
