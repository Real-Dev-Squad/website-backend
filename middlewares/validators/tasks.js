const joi = require('joi')

const createTask = async (req, res, next) => {
  const schema = joi.object().keys({
    type: joi.string().required(),
    links: joi.array().items(joi.string()),
    endsOn: joi.string(),
    startedOn: joi.string().required(),
    status: joi.string().required(),
    ownerId: joi.string().required(),
    percentCompleted: joi.number().optional(),
    dependsOn: joi.array().items(joi.string()),
    participants: joi.array().items(joi.string()),
    completionAward: joi.object().keys({
      gold: joi.number(),
      silver: joi.number(),
      bronze: joi.number()
    }).optional(),
    lossRate: joi.object().keys({
      gold: joi.number(),
      silver: joi.number(),
      bronze: joi.number()
    }).optional()
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
    type: joi.string().optional(),
    links: joi.array().items(joi.string()),
    endsOn: joi.string().optional(),
    startedOn: joi.string().optional(),
    status: joi.string().optional(),
    ownerId: joi.string().optional(),
    percentCompleted: joi.number().optional(),
    dependsOn: joi.array().items(joi.string()),
    participants: joi.array().items(joi.string()),
    completionAward: joi.object().keys({
      gold: joi.number(),
      silver: joi.number(),
      bronze: joi.number()
    }).optional(),
    lossRate: joi.object().keys({
      gold: joi.number(),
      silver: joi.number(),
      bronze: joi.number()
    }).optional()
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
