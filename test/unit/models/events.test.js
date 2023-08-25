const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");

const eventQuery = require("../../../models/events");
const eventModel = firestore.collection("events");

const eventDataArray = require("../../fixtures/events/events")();
const eventData = eventDataArray[0];

describe("Events", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("createEvent", function () {
    it("should create a new event in firestore", async function () {
      // Call the function with sample data
      const result = await eventQuery.createEvent(eventData);

      // Add sample data to Firestore
      const data = (await eventModel.doc(eventData.room_id).get()).data();

      // Verify that the event was created
      expect(result).to.deep.equal(data);
    });
  });

  describe("updateEvent", function () {
    it("should update the enabled property of a event", async function () {
      // Add sample data to Firestore
      const docRef = eventModel.doc(eventData.room_id);
      await docRef.set(eventData);

      // Call the function with sample data
      await eventQuery.updateEvent({ id: "641e3b43a42edf3910cbc8bf", enabled: true }, eventModel);

      // Get updated data from Firestore
      const docSnapshot = await eventModel.doc(docRef.id).get();
      const data = docSnapshot.data();

      // Verify that the enabled property was updated
      expect(data.enabled).to.equal(true);
    });
  });

  describe("endActiveEvent", function () {
    it("should update the lock, reason, and status of a event", async function () {
      // Add sample data to Firestore
      const docRef = await eventModel.add(eventData);

      try {
        // Call the function with sample data
        await eventQuery.endActiveEvent({
          id: docRef.id,
          reason: "test reason",
          lock: true,
        });

        // Get updated data from Firestore
        const docSnapshot = await eventModel.doc(docRef.id).get();
        const data = docSnapshot.data();

        // Verify that the lock, reason, and status properties were updated
        expect(data.lock).to.equal(true);
        expect(data.reason).to.equal("test reason");
        expect(data.status).to.equal("inactive");
      } catch (error) {
        // Check that the function threw an error
        expect(error).to.exist();
        expect(error.message).to.equal("Error in enabling event.");
      }
    });
  });

  describe("getAllEventCodes", function () {
    it("should return an array of event codes", async function () {
      const docRef = eventModel.doc(eventData.room_id);
      await docRef.set(eventData);

      const result = await eventQuery.getAllEventCodes(eventData.room_id);

      expect(result).to.deep.equal(["code1", "code2"]);
    });

    it("should throw an error when document does not exist", async function () {
      const roomId = "nonExistentRoomId";

      try {
        await eventQuery.getAllEventCodes(roomId);
      } catch (error) {
        expect(error.message).to.equal("Document does not exist.");
      }
    });

    it("should throw an error for invalid event structure", async function () {
      const invalidEventStructure = {
        event_codes: {
          byRole: {
            mavens: null,
          },
        },
      };

      const docRef = eventModel.doc(eventData.room_id);
      await docRef.set({ ...eventData, ...invalidEventStructure });

      try {
        await eventQuery.getAllEventCodes(eventData.room_id);
      } catch (error) {
        expect(error.message).to.equal(`Invalid event structure in document ${eventData.room_id}.`);
      }
    });
  });
});
