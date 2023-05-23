/* eslint-disable camelcase */
const { EventAPIService } = require("../services/EventAPIService");
const { EventTokenService } = require("../services/EventTokenService");
const eventQuery = require("../models/events");
const logger = require("../utils/logger");
const { GET_ALL_ROOMS_LIMIT_MIN } = require("../constants/events");

const tokenService = new EventTokenService();
const apiService = new EventAPIService(tokenService);

/**
 * Creates a new room document in the Firestore database with the data provided in the HTTP request body.
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} The saved room data in JSON format.
 * @throws {Error} If an error occurs while creating the room document.
 */
const createRoom = async (req, res) => {
  const { name, description, region, userId } = req.body;
  const payload = { name, description, region };
  try {
    const roomData = await apiService.post("/rooms", payload);
    const { app_id, customer, customer_id, recording_info, template, id: room_id, ...cleanRoomData } = roomData;
    const savedRoomData = await eventQuery.createRoom({ room_id, created_by: userId, ...cleanRoomData });
    return res.status(201).json(savedRoomData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't create room. Please try again later",
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
const getAllRooms = async (req, res) => {
  /**
   * @type {boolean} - enabled: determines whether the rooms should be enabled or disabled.
   * @type {number} - limit: The maximum number of rooms to retrieve.
   * @type {string} - offset: The starting point for retrieving rooms.
   */
  const { enabled, limit, offset } = req.query;
  try {
    const start = offset || "";
    const limitOfRooms = limit || GET_ALL_ROOMS_LIMIT_MIN;
    const isEnabled = enabled || false;
    const roomsData = await apiService.get(`/rooms?limit=${limitOfRooms}&enabled=${isEnabled}&start=${start}`);

    const events = roomsData.data.map(({ id, ...room }) => ({
      ...room,
      room_id: id,
      customer_id: undefined,
      app_id: undefined,
      recording_info: undefined,
      template_id: undefined,
      template: undefined,
      customer: undefined,
    }));

    const responseData = { limit: roomsData.limit, last: roomsData.last, data: events };
    return res.status(200).json(responseData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't get events. Please try again later",
    });
  }
};

/**
 * Generates a token for the specified room and user information.
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} An object containing the generated token and a success message in JSON format.
 * @throws {Error} If an error occurs while generating the token.
 */
const joinRoom = async (req, res) => {
  const { roomId, userId, role } = req.body;
  const payload = { room_id: roomId, user_id: userId, role };
  try {
    const token = tokenService.getAuthToken(payload);
    res.status(200).json({
      token: token,
      msg: "Token generated successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send("Internal Server Error");
  }
};

/**
 * Retrieves room details by ID and returns JSON response
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response containing room details or error message
 * @throws {Object} - The JSON response with an error message if an error occurred if room retrieval fails.
 */
const getRoomById = async (req, res) => {
  const roomId = req.params.id;
  const isActiveRoom = req.body.isActiveRoom;
  try {
    let roomData = await apiService.get(`/${isActiveRoom ? "active-" : ""}rooms/${roomId}`);
    if (!isActiveRoom) {
      roomData = {
        ...roomData,
        room_id: roomData.id,
        customer_id: undefined,
        app_id: undefined,
        recording_info: undefined,
        template_id: undefined,
        template: undefined,
        customer: undefined,
      };
    }

    return res.status(200).json(roomData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Unable to retrieve room details",
    });
  }
};

/**
 * Updates a room with the given ID and enables/disables it
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response containing updated room data and success message or error message
 * @throws {Object} - If an error occurs while updating the room
 */
const updateRoom = async (req, res) => {
  const payload = {
    enabled: req.body.enabled,
  };
  try {
    let roomData = await apiService.post(`/rooms/${req.body.id}`, payload);
    await eventQuery.updateRoom(roomData);
    roomData = {
      ...roomData,
      room_id: roomData.id,
      customer_id: undefined,
      app_id: undefined,
      recording_info: undefined,
      template_id: undefined,
      template: undefined,
      customer: undefined,
    };
    return res.status(200).json({ data: roomData, message: `Room is ${req.body.enabled ? "enabled" : "disabled"}` });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error,
      message: "Couldn't update room. Please try again later.",
    });
  }
};

/**
 * Ends an active room session.
 *
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} The JSON response with a message indicating the session has ended.
 * @throws {Object} The JSON response with an error message if an error occurred while ending the room.
 */
const endActiveRoom = async (req, res) => {
  const payload = {
    reason: req.body.reason,
    lock: req.body.lock,
  };
  try {
    await apiService.post(`/active-rooms/${req.body.id}/end-room`, payload);
    await eventQuery.endActiveRoom({ id: req.body.id, ...payload });
    return res.status(200).json({ message: `Session is ended.` });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't end the room. Please try again later",
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  joinRoom,
  getRoomById,
  updateRoom,
  endActiveRoom,
};
