const joi = require('joi')

const createTask = async (req, res, next) => {
  const schema = joi.object().keys({
    title: joi.string().required(),
    purpose: joi.string().optional(),
    featureUrl: joi.string().optional(),
    type: joi.string().required(),
    links: joi.array().items(joi.string()).optional(),
    endsOn: joi.string().required(),
    startedOn: joi.string().required(),
    status: joi.string().required(),
    assignee: joi.string().optional(),
    percentCompleted: joi.number().required(),
    dependsOn: joi.array().items(joi.string()).optional(),
    participants: joi.array().items(joi.string()).optional(),
    completionAward: joi.object().keys({
      dinero: joi.number().optional(),
      neelam: joi.number().optional()
    }),
    lossRate: joi.object().keys({
      dinero: joi.number().optional(),
      neelam: joi.number().optional()
    }),
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

const updateTask = async (req, res, next) => {
  const schema = joi.object().keys({
    title: joi.string().optional(),
    purpose: joi.string().optional(),
    featureUrl: joi.string().optional(),
    type: joi.string().optional(),
    links: joi.array().items(joi.string()).optional(),
    endsOn: joi.string().optional(),
    startedOn: joi.string().optional(),
    status: joi.string().optional(),
    assignee: joi.string().optional(),
    percentCompleted: joi.number().optional(),
    dependsOn: joi.array().items(joi.string()).optional(),
    participants: joi.array().items(joi.string()).optional(),
    completionAward: joi.object().keys({
      dinero: joi.number().optional(),
      neelam: joi.number().optional()
    }),
    lossRate: joi.object().keys({
      dinero: joi.number().optional(),
      neelam: joi.number().optional()
    }),
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

module.exports = {
  createTask,
  updateTask
}
