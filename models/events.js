const firestore = require("../utils/firestore");
const logger = require("../utils/logger");

const eventModel = firestore.collection("events");

const createRoom = async (roomData) => {
  try {
    const docRef = eventModel.doc(roomData.id);
    await docRef.set(roomData);
    const docSnapshot = await docRef.get();
    const data = docSnapshot.data();
    return data;
  } catch (error) {
    logger.error("Error in adding data", error);
    throw error;
  }
};

const getAllRooms = async () => {
  try {
    const retrievedRooms = [];
    const rooms = await eventModel.get();
    if (rooms.docs.length > 0) {
      for (const room of rooms.docs) {
        retrievedRooms.push(room.data());
      }
    }
    return retrievedRooms;
  } catch (error) {
    logger.error("Error in adding data", error);
    throw error;
  }
};

const updateRoom = async (roomData) => {
  try {
    const docRef = eventModel.doc(roomData.id);
    await docRef.update({ enabled: roomData.enabled });
  } catch (error) {
    logger.error("Error in enabling room.", error);
    throw error;
  }
};

const endActiveRoom = async ({ id, reason, lock }) => {
  try {
    const docRef = eventModel.doc(id);
    await docRef.update({
      lock,
      reason,
      status: "inactive",
    });
  } catch (error) {
    logger.error("Error in enabling room.", error);
    throw error;
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  updateRoom,
  endActiveRoom,
};
