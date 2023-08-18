const joi = require("joi");

const createEvent = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    region: joi.string().required(),
    userId: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error creating event: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const getAllEvents = async (req, res, next) => {
  const schema = joi.object({
    enabled: joi.boolean(),
    limit: joi.number().integer().min(10),
    offset: joi.string(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error retrieving all events: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const joinEvent = async (req, res, next) => {
  const schema = joi.object({
    roomId: joi.string().required(),
    userId: joi.string().required(),
    role: joi.string().valid("host", "moderator", "guest", "maven").required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error joining event: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const getEventById = async (req, res, next) => {
  const { id } = req.params;
  const { isActiveRoom } = req.query;

  const schema = joi.object({
    id: joi.string().required(),
    isActiveRoom: joi.boolean(),
  });

  const validationOptions = { abortEarly: false };

  try {
    await schema.validateAsync({ id, isActiveRoom }, validationOptions);
    next();
  } catch (error) {
    logger.error(`Error retrieving event: ${error}`);
    res.boom.badRequest(error.details.map((detail) => detail.message));
  }
};

const updateEvent = async (req, res, next) => {
  const schema = joi.object({
    id: joi.string().required(),
    enabled: joi.boolean().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error updating event: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const endActiveEvent = async (req, res, next) => {
  const schema = joi.object({
    id: joi.string().required(),
    reason: joi.string().required(),
    lock: joi.boolean().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error while ending the event: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  joinEvent,
  getEventById,
  updateEvent,
  endActiveEvent,
};
