const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");

const eventQuery = require("../../../models/events");
const eventModel = firestore.collection("events");
const peerModel = firestore.collection("peers");

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

  describe("addPeerToEvent", function () {
    it("should create a new peer document if it doesn't exist", async function () {
      const docRef = await eventModel.add(eventData);

      // Define sample peer data with a non-existing peer name
      const peerData = {
        name: "NonExistingPeer",
        eventId: docRef.id,
        role: "participant",
        joinedAt: new Date(),
      };

      try {
        const result = await eventQuery.addPeerToEvent(peerData);

        // Get the created peer document from Firestore
        const docSnapshot = await peerModel.doc(result.id).get();
        const data = docSnapshot.data();

        expect(data.name).to.equal(peerData.name);
        expect(data.joinedEvents).to.have.lengthOf(1);
        expect(data.joinedEvents[0].event_id).to.equal(peerData.eventId);
        expect(data.joinedEvents[0].role).to.equal(peerData.role);
      } catch (error) {
        // Check that the function threw an error
        expect(error).to.not.exist();
      }
    });

    it("should update the joinedEvents array if the peer document exists", async function () {
      const docRef = await eventModel.add(eventData);

      // Define sample peer data with an existing peer name
      const peerData = {
        name: "ExistingPeer",
        eventId: docRef.id,
        role: "participant",
        joinedAt: new Date(),
      };

      // Add an existing peer document to Firestore for the test
      const existingPeerDoc = await peerModel.add({
        name: peerData.name,
        joinedEvents: [],
      });

      try {
        await eventQuery.addPeerToEvent(peerData);

        const docSnapshot = await peerModel.doc(existingPeerDoc.id).get();
        const data = docSnapshot.data();

        // Verify that the joinedEvents array was updated correctly
        expect(data.joinedEvents).to.have.lengthOf(1);
        expect(data.joinedEvents[0].event_id).to.equal(peerData.eventId);
        expect(data.joinedEvents[0].role).to.equal(peerData.role);
      } catch (error) {
        // Check that the function threw an error
        expect(error).to.not.exist();
      }
    });

    it("should throw an error if there is an error in storing peer reference in the event model", async function () {
      const docRef = await eventModel.add(eventData);

      const peerData = {
        name: "John",
        eventId: docRef.id,
        role: "host",
        joinedAt: new Date(),
      };

      // Mock an error during storing the peer reference
      const storePeerReferenceInEvent = sinon
        .stub(eventQuery, "storePeerReferenceInEvent")
        .throws(new Error("Sample error"));

      try {
        await eventQuery.addPeerToEvent(peerData);
      } catch (error) {
        // Check that the function threw the expected error
        expect(error).to.exist();
        expect(error.message).to.equal("Error in storing peer reference in event model: Sample error");
      } finally {
        storePeerReferenceInEvent.restore();
      }
    });

    it("should throw an error if there is an error in adding the peer to the event", async function () {
      const docRef = await eventModel.add(eventData);

      const peerData = {
        name: "John",
        eventId: docRef.id,
        role: "host",
        joinedAt: new Date(),
      };

      // Mock an error during adding the peer to the event
      const addStub = sinon.stub(peerModel, "add").throws(new Error("Sample error"));

      try {
        await eventQuery.addPeerToEvent(peerData);
      } catch (error) {
        // Check that the function threw the expected error
        expect(error).to.exist();
        expect(error.message).to.equal("Error in adding peer to the event: Sample error");
      } finally {
        addStub.restore();
      }
    });
  });
});
