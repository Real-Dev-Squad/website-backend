const admin = require("firebase-admin");
const Firestore = require("@google-cloud/firestore");
const firestore = require("../utils/firestore");
const logger = require("../utils/logger");

const eventModel = firestore.collection("events");
const peerModel = firestore.collection("peers");
const eventCodeModel = firestore.collection("event-codes");

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
    const batch = firestore.batch();

    const peerRef = peerModel.doc(peerData.peerId);
    const peerDocSnapshot = await peerRef.get();

    if (!peerDocSnapshot.exists) {
      // If the peer document doesn't exist, create a new one
      const peerDocData = {
        peerId: peerData.peerId,
        name: peerData.name,
        joinedEvents: [
          {
            event_id: peerData.eventId,
            role: peerData.role,
            joined_at: peerData.joinedAt,
          },
        ],
      };
      batch.set(peerRef, peerDocData);
    } else {
      // If the peer document exists, update the joinedEvents array
      batch.update(peerRef, {
        joinedEvents: Firestore.FieldValue.arrayUnion({
          event_id: peerData.eventId,
          role: peerData.role,
          joined_at: peerData.joinedAt,
        }),
      });
    }

    const eventRef = eventModel.doc(peerData.eventId);
    batch.update(eventRef, {
      peers: Firestore.FieldValue.arrayUnion(peerRef.id),
    });

    await batch.commit();

    const updatedPeerSnapshot = await peerRef.get();
    return updatedPeerSnapshot.data();
  } catch (error) {
    logger.error("Error in adding peer to the event", error);
    throw error;
  }
};

/**
 * Removes a peer from an event and marks them as kicked out in the Firestore database.
 * @async
 * @function
 * @param {Object} params - The parameters for kicking out the peer.
 * @param {string} params.eventId - The unique identifier of the event from which the peer is being kicked out.
 * @param {string} params.peerId - The unique identifier of the peer being kicked out.
 * @param {string} params.reason - The reason for kicking out the peer from the event.
 * @returns {Promise<Object>} The updated data of the kicked-out peer.
 * @throws {Error} If the peer is not found or is not part of the specified event.
 */
const kickoutPeer = async ({ eventId, peerId, reason }) => {
  try {
    const peerRef = peerModel.doc(peerId);
    const peerSnapshot = await peerRef.get();

    if (!peerSnapshot.exists) {
      throw new Error("Participant not found");
    }

    const peerData = peerSnapshot.data();
    const joinedEvents = peerData.joinedEvents;

    const eventIndex = joinedEvents.findIndex((event) => event.event_id === eventId);
    if (eventIndex === -1) {
      throw new Error("Participant is not part of the specified event");
    }

    const updatedJoinedEvents = joinedEvents.map((event, index) =>
      index === eventIndex ? { ...event, left_at: new Date(), reason: reason, isKickedout: true } : event
    );

    await peerRef.update({ joinedEvents: updatedJoinedEvents });

    const updatedPeerSnapshot = await peerRef.get();
    return updatedPeerSnapshot.data();
  } catch (error) {
    logger.error("Error in removing peer from the event.", error);
    throw error;
  }
};
/**
 * Creates an events code document in the Firestore database with the given event code data.
 * @async
 * @function
 * @param {object} eventCodeData - The data for the event code to be created.
 * @throws {Error} If an error occurs while creating the event code document.
 */

const createEventCode = async (eventCodeData) => {
  try {
    const eventRef = eventModel.doc(eventCodeData.event_id);
    const eventSnapshot = await eventRef.get();
    const eventSnapshotData = eventSnapshot.data();
    const createdAndUpdatedAt = admin.firestore.Timestamp.now();
    const docRef = eventCodeModel.doc(eventCodeData.id);

    await docRef.set({ ...eventCodeData, created_at: createdAndUpdatedAt, updated_at: createdAndUpdatedAt });

    const docSnapshot = await docRef.get();
    const data = docSnapshot.data();

    if (data) {
      await eventRef.update({
        event_codes: {
          byRole: {
            mavens: [
              ...eventSnapshotData?.event_codes?.byRole?.mavens,
              {
                ...data,
              },
            ],
          },
        },
      });
    }
    return data;
  } catch (error) {
    logger.error("Error in adding data", error);
    throw error;
  }
};

module.exports = {
  createEvent,
  updateEvent,
  endActiveEvent,
  addPeerToEvent,
  kickoutPeer,
  createEventCode,
};
