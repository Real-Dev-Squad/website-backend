// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')

const createAuction = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    item_type: joi.string().required(),
    quantity: joi.number().required(),
    initial_price: joi.number().required(),
    end_time: joi.number().required()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error creating auction : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

const placeBid = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    bid: joi.number().required()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error creating auction : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  createAuction,
  placeBid
}
