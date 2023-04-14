const { EventAPIService } = require("../services/EventAPIService");
const { EventTokenService } = require("../services/EventTokenService");
const eventQuery = require("../models/events");
const logger = require("../utils/logger");

const tokenService = new EventTokenService();
const apiService = new EventAPIService(tokenService);

const createRoom = async (req, res) => {
  const payload = {
    name: req.body.name,
    description: req.body.description,
    region: req.body.region,
  };
  try {
    const roomData = await apiService.post("/rooms", payload);
    const savedRoomData = await eventQuery.createRoom(roomData);
    return res.status(200).json(savedRoomData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't create room. Please try again later",
    });
  }
};

const getAllRooms = async (req, res) => {
  const { enabled, hits, offset } = req.query;
  try {
    const start = offset || "";
    const roomsData = await apiService.get(`/rooms?limit=${hits}&enabled=${enabled}&start=${start}`);
    // const roomsData = await eventQuery.getAllRooms();
    return res.status(200).json(roomsData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't get rooms. Please try again later",
    });
  }
};

const joinRoom = async (req, res) => {
  try {
    const token = tokenService.getAuthToken({
      room_id: req.body.roomId,
      user_id: req.body.userId,
      role: req.body.role,
    });
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

const getRoomById = async (req, res) => {
  const roomId = req.params.id;
  const enabled = req.body.enabled;
  try {
    const roomData = await apiService.get(`/${enabled ? "active-" : ""}rooms/${roomId}`);
    return res.status(200).json(roomData);
  } catch (error) {
    logger.error({ error });
    if (error.status === 404) {
      return res.status(404).json({
        error: error.code,
        message: "Room not found",
      });
    }
    return res.status(500).json({
      error: error.code,
      message: "Unable to retrieve room details",
    });
  }
};

const updateRoom = async (req, res) => {
  const payload = {
    enabled: req.body.enabled,
  };
  try {
    const roomData = await apiService.post(`/rooms/${req.body.id}`, payload);
    logger.info({ roomData });
    await eventQuery.updateRoom(roomData);
    return res.status(200).json({ data: roomData, message: `Room is ${req.body.enabled ? "enabled" : "disabled"}` });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error,
      message: "Couldn't update room. Please try again later.",
    });
  }
};

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
