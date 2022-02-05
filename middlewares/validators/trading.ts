// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'newTrade'.
const newTrade = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    stockId: joi.string().required(),
    tradeType: joi.string().required(),
    stockName: joi.string().required(),
    quantity: joi.number().required(),
    listedPrice: joi.number().required(),
    totalPrice: joi.number().required()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating newTrade payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  newTrade
}
