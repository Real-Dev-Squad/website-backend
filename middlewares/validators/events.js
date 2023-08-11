const joi = require("joi");
const { ERROR_MESSAGES } = require("../../constants/events");

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
    logger.error(`${ERROR_MESSAGES.VALIDATORS.CREATE_EVENT} ${error}`);
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
    logger.error(`${ERROR_MESSAGES.VALIDATORS.GET_ALL_EVENTS} ${error}`);
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
    logger.error(`${ERROR_MESSAGES.VALIDATORS.JOIN_EVENT} ${error}`);
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
    logger.error(`${ERROR_MESSAGES.VALIDATORS.GET_EVENT_BY_ID} ${error}`);
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
    logger.error(`${ERROR_MESSAGES.VALIDATORS.UPDATE_EVENT} ${error}`);
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
    logger.error(`${ERROR_MESSAGES.VALIDATORS.END_ACTIVE_EVENT} ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const addPeerToEvent = async (req, res, next) => {
  const { id } = req.params;
  const { peerId, name, role, joinedAt } = req.body;

  const schema = joi.object({
    peerId: joi.string().required(),
    name: joi.string().required(),
    id: joi.string().required(),
    role: joi.string().required(),
    joinedAt: joi.date().required(),
  });

  const validationOptions = { abortEarly: false };

  try {
    await schema.validateAsync({ peerId, name, id, role, joinedAt }, validationOptions);
    next();
  } catch (error) {
    logger.error(`${ERROR_MESSAGES.VALIDATORS.ADD_PEER_TO_EVENT} ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const kickoutPeer = async (req, res, next) => {
  const { id } = req.params;
  const { peerId, reason } = req.body;

  const schema = joi.object({
    id: joi.string().required(),
    peerId: joi.string().required(),
    reason: joi.string().required(),
  });

  const validationOptions = { abortEarly: false };

  try {
    await schema.validateAsync({ id, peerId, reason }, validationOptions);
    next();
  } catch (error) {
    logger.error(`${ERROR_MESSAGES.VALIDATORS.KICKOUT_PEER} ${error}`);
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
  addPeerToEvent,
  kickoutPeer,
};
