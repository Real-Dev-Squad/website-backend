const firestore = require("../utils/firestore");
const logger = require("../utils/logger");

const eventModel = firestore.collection("events");

/**
 * Creates a new room document in Firestore and returns the data for the created document.
 * @async
 * @function
 * @param {Object} roomData - The data to be added to the room document in Firestore.
 * @returns {Promise<Object>} - The data for the created room document.
 * @throws {Error} - Throws an error if there was a problem adding data to Firestore.
 */
const createRoom = async (roomData) => {
  try {
    const docRef = eventModel.doc(roomData.room_id);
    await docRef.set(roomData);
    const docSnapshot = await docRef.get();
    const data = docSnapshot.data();
    return data;
  } catch (error) {
    logger.error("Error in adding data", error);
    throw error;
  }
};

/**
 * Updates an existing room document in the Firestore database with the given room data.
 * @async
 * @function
 * @param {object} roomData - The data for the room to be updated.
 * @throws {Error} If an error occurs while updating the room document.
 */
const updateRoom = async (roomData) => {
  try {
    const docRef = eventModel.doc(roomData.id);
    await docRef.update({ enabled: roomData.enabled });
  } catch (error) {
    logger.error("Error in enabling room.", error);
    throw error;
  }
};

/**
 * Ends an active room in the Firestore database with the given data.
 * @async
 * @function
 * @param {object} data - The data for the room to be ended.
 * @param {string} data.id - The unique identifier for the room to be ended.
 * @param {string} data.reason - The reason for ending the room.
 * @param {boolean} data.lock - Whether the room should be locked after it's ended.
 * @throws {Error} If an error occurs while updating the room document.
 */
const endActiveRoom = async ({ id, reason, lock }) => {
  try {
    const docRef = eventModel.doc(id);
    await docRef.update({
      lock,
      reason,
      enabled: false,
      status: "inactive",
    });
  } catch (error) {
    logger.error("Error in enabling room.", error);
    throw error;
  }
};

module.exports = {
  createRoom,
  updateRoom,
  endActiveRoom,
};
