const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");

const eventQuery = require("../../../models/events");
const eventModel = firestore.collection("events");

const eventDataArray = require("../../fixtures/events/events")();
const eventData = eventDataArray[0];

describe("Rooms", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("createRoom", function () {
    it("should create a new room in firestore", async function () {
      // Call the function with sample data
      const result = await eventQuery.createRoom(eventData);

      // Add sample data to Firestore
      const data = (await eventModel.doc(eventData.id).get()).data();

      // Verify that the room was created
      expect(result).to.deep.equal(data);
    });
  });

  describe("getAllRooms", function () {
    it("should update the enabled property of a room", async function () {
      // Add sample data to Firestore
      const docRef = eventModel.doc(eventData.id);
      await docRef.set(eventData);

      // Call the function with sample data
      await eventQuery.updateRoom({ id: "1", enabled: true }, eventModel);

      // Get updated data from Firestore
      const docSnapshot = await eventModel.doc(docRef.id).get();
      const data = docSnapshot.data();

      // Verify that the enabled property was updated
      expect(data.enabled).to.equal(true);
    });
  });

  describe("endActiveRoom", function () {
    it("should update the lock, reason, and status of a room", async function () {
      // Add sample data to Firestore
      const docRef = await eventModel.add(eventData);

      try {
        // Call the function with sample data
        await eventQuery.endActiveRoom({
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
        expect(error.message).to.equal("Error in enabling room.");
      }
    });
  });
});
