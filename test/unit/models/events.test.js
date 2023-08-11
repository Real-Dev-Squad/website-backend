const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");

const eventQuery = require("../../../models/events");
const { ERROR_MESSAGES } = require("../../../constants/events");
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

  describe("kickoutPeer", function () {
    it("should kick out a peer from an event", async function () {
      const docRef = await eventModel.add(eventData);

      const peerData = {
        peerId: "peer123",
        name: "TestPeer",
        eventId: docRef.id,
        role: "participant",
        joinedAt: new Date(),
      };

      await eventQuery.addPeerToEvent(peerData);

      const reason = "test reason";
      const kickedOutPeer = await eventQuery.kickoutPeer({
        eventId: peerData.eventId,
        peerId: peerData.peerId,
        reason,
      });

      expect(kickedOutPeer.joinedEvents[0].isKickedout).to.equal(true);
      expect(kickedOutPeer.joinedEvents[0].reason).to.equal(reason);

      const leftAtDate = kickedOutPeer.joinedEvents[0].left_at.toDate();
      expect(leftAtDate).to.be.an.instanceOf(Date);
    });

    it("should throw an error if the peer is not found", async function () {
      const peerId = "nonExistentPeer";
      const eventId = "event456";
      const reason = "test reason";

      try {
        await eventQuery.kickoutPeer({ eventId, peerId, reason });
      } catch (error) {
        expect(error.message).to.equal(ERROR_MESSAGES.MODELS.KICKOUT_PEER.PEER_NOT_FOUND);
      }
    });

    it("should throw an error if the peer is not part of the specified event", async function () {
      const docRef = await eventModel.add(eventData);

      const peerData = {
        peerId: "peer123",
        name: "TestPeer",
        eventId: docRef.id,
        role: "participant",
        joinedAt: new Date(),
      };

      await eventQuery.addPeerToEvent(peerData);

      const nonExistentEventId = "nonExistentEvent";
      const reason = "test reason";

      try {
        await eventQuery.kickoutPeer({ eventId: nonExistentEventId, peerId: peerData.peerId, reason });
      } catch (error) {
        expect(error.message).to.equal(ERROR_MESSAGES.MODELS.KICKOUT_PEER.PEER_NOT_FOUND_IN_EVENT);
      }
    });
  });
});
