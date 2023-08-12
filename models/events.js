const firestore = require("../utils/firestore");
const logger = require("../utils/logger");

const eventModel = firestore.collection("events");

/**
 * Creates a new event document in Firestore and returns the data for the created document.
 * @async
 * @function
 * @param {Object} eventData - The data to be added to the event document in Firestore.
 * @returns {Promise<Object>} - The data for the created event document.
 * @throws {Error} - Throws an error if there was a problem adding data to Firestore.
 */
const createEvent = async (eventData) => {
  try {
    const docRef = eventModel.doc(eventData.room_id);
    await docRef.set(eventData);
    const docSnapshot = await docRef.get();
    const data = docSnapshot.data();
    return data;
  } catch (error) {
    logger.error("Error in adding data", error);
    throw error;
  }
};

/**
 * Updates an existing event document in the Firestore database with the given event data.
 * @async
 * @function
 * @param {object} eventData - The data for the event to be updated.
 * @throws {Error} If an error occurs while updating the event document.
 */
const updateEvent = async (eventData) => {
  try {
    const docRef = eventModel.doc(eventData.id);
    await docRef.update({ enabled: eventData.enabled });
  } catch (error) {
    logger.error("Error in enabling event.", error);
    throw error;
  }
};

/**
 * Ends an active event in the Firestore database with the given data.
 * @async
 * @function
 * @param {object} data - The data for the event to be ended.
 * @param {string} data.id - The unique identifier for the event to be ended.
 * @param {string} data.reason - The reason for ending the event.
 * @param {boolean} data.lock - Whether the event should be locked after it's ended.
 * @throws {Error} If an error occurs while updating the event document.
 */
const endActiveEvent = async ({ id, reason, lock }) => {
  try {
    const docRef = eventModel.doc(id);
    await docRef.update({
      lock,
      reason,
      enabled: false,
      status: "inactive",
    });
  } catch (error) {
    logger.error("Error in ending event.", error);
    throw error;
  }
};

module.exports = {
  createEvent,
  updateEvent,
  endActiveEvent,
};
