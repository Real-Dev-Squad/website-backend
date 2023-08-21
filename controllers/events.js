const { GET_ALL_EVENTS_LIMIT_MIN, UNWANTED_PROPERTIES_FROM_100MS } = require("../constants/events");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

const { EventTokenService, EventAPIService } = require("../services");
const eventQuery = require("../models/events");

const logger = require("../utils/logger");
const { removeUnwantedProperties } = require("../utils/events");

const tokenService = new EventTokenService();
const apiService = new EventAPIService(tokenService);

/**
 * Creates a new event document in the Firestore database with the data provided in the HTTP request body.
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} The saved event data in JSON format.
 * @throws {Error} If an error occurs while creating the event document.
 */
const createEvent = async (req, res) => {
  const { name, description, region, userId } = req.body;
  const payload = { name, description, region };
  try {
    const eventData = await apiService.post("/rooms", payload);
    const event = removeUnwantedProperties(UNWANTED_PROPERTIES_FROM_100MS, eventData);
    const eventDataFromDB = await eventQuery.createEvent({ room_id: eventData.id, created_by: userId, ...event });
    return res.status(201).json(eventDataFromDB);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't create event. Please try again later",
    });
  }
};

/**
 * Retrieves all events that match the query parameters provided in the HTTP request query string.
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} The events data in JSON format.
 * @throws {Error} If an error occurs while retrieving the events data.
 */
const getAllEvents = async (req, res) => {
  /**
   * @type {boolean} - enabled: determines whether the rooms should be enabled or disabled.
   * @type {number} - limit: The maximum number of rooms to retrieve.
   * @type {string} - offset: The starting point for retrieving rooms.
   */
  const { enabled, limit, offset } = req.query;
  try {
    const start = offset || "";
    const limitOfRooms = limit || GET_ALL_EVENTS_LIMIT_MIN;
    const isEnabled = enabled || false;
    const eventsData = await apiService.get(`/rooms?limit=${limitOfRooms}&enabled=${isEnabled}&start=${start}`);
    if (eventsData?.data) {
      const events = removeUnwantedProperties(UNWANTED_PROPERTIES_FROM_100MS, eventsData.data);

      const filteredEventsData = {
        limit: eventsData.limit,
        last: eventsData.last,
        data: events.map(({ id, ...event }) => ({
          id,
          room_id: id,
          ...event,
        })),
      };
      return res.status(200).json(filteredEventsData);
    }
    return res.status(200).json(eventsData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't get events. Please try again later",
    });
  }
};

/**
 * Generates a token for the specified event and user information.
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} An object containing the generated token and a success message in JSON format.
 * @throws {Error} If an error occurs while generating the token.
 */
const joinEvent = async (req, res) => {
  const { roomId, userId, role } = req.body;
  const payload = { roomId, userId, role };
  try {
    const token = tokenService.getAuthToken(payload);
    return res.status(201).json({
      token: token,
      message: "Token generated successfully!",
      success: true,
    });
  } catch (error) {
    logger.error({ error });
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Retrieves event details by ID and returns JSON response
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response containing event details or error message
 * @throws {Object} - The JSON response with an error message if an error occurred if event retrieval fails.
 */
const getEventById = async (req, res) => {
  const roomId = req.params.id;
  const isActiveRoom = req.body.isActiveRoom;
  try {
    const url = `/${isActiveRoom ? "active-" : ""}rooms/${roomId}`;
    const eventData = await apiService.get(url);
    if (!isActiveRoom) {
      const event = removeUnwantedProperties(UNWANTED_PROPERTIES_FROM_100MS, eventData);
      return res.status(200).json({ room_id: event.id, ...event });
    }
    return res.status(200).json(eventData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Unable to retrieve event details",
    });
  }
};

/**
 * Updates a event with the given ID and enables/disables it
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response containing updated event data and success message or error message
 * @throws {Object} - If an error occurs while updating the event
 */
const updateEvent = async (req, res) => {
  const payload = {
    enabled: req.body.enabled,
  };
  try {
    const eventData = await apiService.post(`/rooms/${req.body.id}`, payload);
    await eventQuery.updateEvent(eventData);
    const event = removeUnwantedProperties(UNWANTED_PROPERTIES_FROM_100MS, eventData);
    return res.status(200).json({
      data: { room_id: event.id, ...event },
      message: `Event is ${req.body.enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error,
      message: "Couldn't update event. Please try again later.",
    });
  }
};

/**
 * Ends an active event.
 *
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} The JSON response with a message indicating the session has ended.
 * @throws {Object} The JSON response with an error message if an error occurred while ending the event.
 */
const endActiveEvent = async (req, res) => {
  const payload = {
    reason: req.body.reason,
    lock: req.body.lock,
  };
  try {
    await apiService.post(`/active-rooms/${req.body.id}/end-room`, payload);
    await eventQuery.endActiveEvent({ id: req.body.id, ...payload });
    return res.status(200).json({ message: `Event ended successfully.` });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't end the event. Please try again later",
    });
  }
};

/**
 * Adds a peer to an event.
 *
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} The JSON response with the added peer data and a success message.
 * @throws {Object} The JSON response with an error message if an error occurred while adding the peer.
 */
const addPeerToEvent = async (req, res) => {
  try {
    const data = await eventQuery.addPeerToEvent({
      peerId: req.body.peerId,
      name: req.body.name,
      role: req.body.role,
      joinedAt: req.body.joinedAt,
      eventId: req.params.id,
    });
    return res.status(200).json({
      data,
      message: `Selected Participant is added to the event.`,
    });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "You can't add selected Participant. Please ask Admin or Host for help.",
    });
  }
};

/**
 * Kicks out a peer from an event.
 *
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} The JSON response with a success message if the peer is successfully kicked out.
 * @throws {Object} The JSON response with an error message if an error occurred while kicking out the peer.
 */
const kickoutPeer = async (req, res) => {
  const { id } = req.params;
  const payload = {
    peer_id: req.body.peerId,
    reason: req.body.reason,
  };

  try {
    await apiService.post(`/active-rooms/${id}/remove-peers`, payload);
    await eventQuery.kickoutPeer({ eventId: id, peerId: payload.peer_id, reason: req.body.reason });
    return res.status(200).json({
      message: `Selected Participant is removed from event.`,
    });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "You can't remove selected Participant from Remove, Please ask Admin or Host for help.",
    });
  }
};

/**
 * Gets event codes for particular event
 *
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} The JSON response with a success message if the event codes are fetched succesfully
 * @throws {Object} The JSON response with an error message if an error occurred while getting the event codes data
 */
const getEventCodes = async (req, res) => {
  const { id } = req.params;

  try {
    const eventCodes = await eventQuery.getEventCodes({ id });

    return res.status(200).json({
      message: "Event codes is successfully fetched for the event!",
      event_codes: eventCodes,
    });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Something went wrong while getting the event codes!",
    });
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
  getEventCodes,
};
