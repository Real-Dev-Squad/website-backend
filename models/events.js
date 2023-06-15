const Firestore = require("@google-cloud/firestore");
const firestore = require("../utils/firestore");
const logger = require("../utils/logger");

const eventModel = firestore.collection("events");
const peerModel = firestore.collection("peers");

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

/**
 * Stores a reference to a peer in the event document in the Firestore database.
 * @async
 * @function
 * @param {string} peerId - The ID of the peer document to be referenced.
 * @param {string} eventId - The ID of the event document where the peer reference will be stored.
 * @throws {Error} If an error occurs while updating the event document.
 */
const storePeerReferenceInEvent = async (peerId, eventId) => {
  const eventDocRef = eventModel.doc(eventId);
  await eventDocRef.update({
    peers: Firestore.FieldValue.arrayUnion(peerId),
  });
};

/**
 * Adds a peer to an event in the Firestore database.
 * @async
 * @function
 * @param {Object} peerData - The data of the peer to be added.
 * @param {string} peerData.name - The name of the peer.
 * @param {string} peerData.eventId - The unique identifier of the event the peer is being added to.
 * @param {string} peerData.role - The role of the peer in the event.
 * @param {Date} peerData.joinedAt - The timestamp indicating when the peer joined the event.
 * @returns {Promise<Object>} The data of the added peer.
 * @throws {Error} If an error occurs while adding the peer to the event.
 */
const addPeerToEvent = async (peerData) => {
  try {
    let docRef;
    const querySnapshot = await peerModel.where("name", "==", peerData.name).limit(1).get();

    if (querySnapshot.empty) {
      // If the peer document doesn't exist, create a new one
      docRef = await peerModel.add({
        name: peerData.name,
        joinedEvents: [
          {
            event_id: peerData.eventId,
            role: peerData.role,
            joined_at: peerData.joinedAt,
          },
        ],
      });
    } else {
      // If the peer document exists, update the joinedEvents array
      const doc = querySnapshot.docs[0];
      docRef = doc.ref;
      await docRef.update({
        joinedEvents: Firestore.FieldValue.arrayUnion({
          event_id: peerData.eventId,
          role: peerData.role,
          joined_at: peerData.joinedAt,
        }),
      });
    }

    const docId = docRef.id;
    await docRef.update({ id: docId });

    // Store a reference of the document in the event model
    try {
      await storePeerReferenceInEvent(docId, peerData.eventId);
    } catch (error) {
      throw new Error(`Error in storing peer reference in event model: ${error.message}`);
    }

    const docSnapshot = await docRef.get();
    const data = docSnapshot.data();
    return data;
  } catch (error) {
    logger.error("Error in adding peer to the event", error);
    throw error;
  }
};

module.exports = {
  createEvent,
  updateEvent,
  endActiveEvent,
  addPeerToEvent,
};
