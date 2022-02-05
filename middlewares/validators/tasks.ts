// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joi'.
const joi = require('joi')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DINERO'.
const { DINERO, NEELAM } = require('../../constants/wallets')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createTask... Remove this comment to see the full error message
const createTask = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    title: joi.string().required(),
    purpose: joi.string().optional(),
    featureUrl: joi.string().optional(),
    type: joi.string().required(),
    links: joi.array().items(joi.string()).optional(),
    startedOn: joi.number().optional(),
    endsOn: joi.number().optional(),
    status: joi.string().required(),
    assignee: joi.string().optional(),
    percentCompleted: joi.number().required(),
    dependsOn: joi.array().items(joi.string()).optional(),
    participants: joi.array().items(joi.string()).optional(),
    completionAward: joi.object().keys({
      [DINERO]: joi.number().optional(),
      [NEELAM]: joi.number().optional()
    }).optional(),
    lossRate: joi.object().keys({
      [DINERO]: joi.number().optional(),
      [NEELAM]: joi.number().optional()
    }).optional(),
    isNoteworthy: joi.bool().optional()
  })

  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating createTask payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'updateTask... Remove this comment to see the full error message
const updateTask = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    title: joi.string().optional(),
    purpose: joi.string().optional(),
    featureUrl: joi.string().optional(),
    type: joi.string().optional(),
    links: joi.array().items(joi.string()).optional(),
    endsOn: joi.number().optional(),
    startedOn: joi.number().optional(),
    status: joi.string().optional(),
    assignee: joi.string().optional(),
    percentCompleted: joi.number().optional(),
    dependsOn: joi.array().items(joi.string()).optional(),
    participants: joi.array().items(joi.string()).optional(),
    completionAward: joi.object().keys({
      [DINERO]: joi.number().optional(),
      [NEELAM]: joi.number().optional()
    }).optional(),
    lossRate: joi.object().keys({
      [DINERO]: joi.number().optional(),
      [NEELAM]: joi.number().optional()
    }).optional(),
    isNoteworthy: joi.bool().optional()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating updateTask payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'updateSelf... Remove this comment to see the full error message
const updateSelfTask = async (req: any, res: any, next: any) => {
  const schema = joi.object().strict().keys({
    status: joi.string().optional(),
    percentCompleted: joi.number().optional()
  })
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    logger.error(`Error validating updateSelfTask payload : ${error}`)
    res.boom.badRequest(error.details[0].message)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  createTask,
  updateTask,
  updateSelfTask
}
