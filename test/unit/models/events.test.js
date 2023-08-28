const chai = require("chai");
const { expect } = chai;

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
      const result = await eventQuery.createEvent(eventData);

      const data = (await eventModel.doc(eventData.room_id).get()).data();

      expect(result).to.deep.equal(data);
    });
  });

  describe("updateEvent", function () {
    it("should update the enabled property of a event", async function () {
      const docRef = eventModel.doc(eventData.room_id);
      await docRef.set(eventData);

      await eventQuery.updateEvent({ id: "641e3b43a42edf3910cbc8bf", enabled: true }, eventModel);

      const docSnapshot = await eventModel.doc(docRef.id).get();
      const data = docSnapshot.data();

      expect(data.enabled).to.equal(true);
    });
  });

  describe("endActiveEvent", function () {
    it("should update the lock, reason, and status of a event", async function () {
      const docRef = await eventModel.add(eventData);

      try {
        await eventQuery.endActiveEvent({
          id: docRef.id,
          reason: "test reason",
          lock: true,
        });

        const docSnapshot = await eventModel.doc(docRef.id).get();
        const data = docSnapshot.data();

        expect(data.lock).to.equal(true);
        expect(data.reason).to.equal("test reason");
        expect(data.status).to.equal("inactive");
      } catch (error) {
        expect(error).to.exist();
        expect(error.message).to.equal("Error in enabling event.");
      }
    });
  });

  describe("addPeerToEvent", function () {
    it("should create a new peer document if it doesn't exist", async function () {
      const docRef = await eventModel.add(eventData);

      const peerData = {
        peerId: "someid",
        name: "NonExistingPeer",
        eventId: docRef.id,
        role: "participant",
        joinedAt: new Date(),
      };

      const result = await eventQuery.addPeerToEvent(peerData);

      const docSnapshot = await peerModel.doc(result.peerId).get();
      const data = docSnapshot.data();

      expect(data.name).to.equal(peerData.name);
      expect(data.joinedEvents).to.have.lengthOf(1);
      expect(data.joinedEvents[0].event_id).to.equal(peerData.eventId);
      expect(data.joinedEvents[0].role).to.equal(peerData.role);
    });

    it("should update the joinedEvents array if the peer document exists", async function () {
      const docRef = await eventModel.add(eventData);

      const peerData = {
        peerId: "someid",
        name: "ExistingPeer",
        eventId: docRef.id,
        role: "participant",
        joinedAt: new Date(),
      };

      await peerModel.add({
        peerId: peerData.peerId,
        name: peerData.name,
        joinedEvents: [],
      });

      await eventQuery.addPeerToEvent(peerData);

      const docSnapshot = await peerModel.doc(peerData.peerId).get();
      const data = docSnapshot.data();

      expect(data.joinedEvents).to.have.lengthOf(1);
      expect(data.joinedEvents[0].event_id).to.equal(peerData.eventId);
      expect(data.joinedEvents[0].role).to.equal(peerData.role);
    });
  });

  describe("createEventCode", function () {
    it("should create a new event code document if it doesn't exist", async function () {
      const eventDocRef = await eventModel.add(eventData);
      const eventCodeData = {
        code: "test-code",
        role: "maven",
        event_id: eventDocRef.id,
        id: "test-id",
      };

      const result = await eventQuery.createEventCode(eventCodeData);

      expect(result[0].code).to.equal(eventCodeData.code);
      expect(result[0].event_id).to.equal(eventCodeData.event_id);
      expect(result[0].role).to.equal(eventCodeData.role);
      expect(result[0].id).to.equal(eventCodeData.id);
    });

    it("should update the event code in events modal event_codes array if the event codes already exists", async function () {
      const eventDocRef = await eventModel.add(eventData);

      const eventCodeDataFirst = {
        code: "test-code-1",
        role: "maven",
        event_id: eventDocRef.id,
        id: "test-id-1",
      };

      const eventCodeDataSecond = {
        code: "test-code-2",
        role: "maven",
        event_id: eventDocRef.id,
        id: "test-id-2",
      };

      await eventQuery.createEventCode(eventCodeDataFirst);
      const result2 = await eventQuery.createEventCode(eventCodeDataSecond);

      expect(result2).to.have.lengthOf(2);
      expect(result2[0].id).to.equal(eventCodeDataFirst.id);
      expect(result2[1].id).to.equal(eventCodeDataSecond.id);
      expect(result2[0].code).to.equal(eventCodeDataFirst.code);
      expect(result2[1].code).to.equal(eventCodeDataSecond.code);
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
