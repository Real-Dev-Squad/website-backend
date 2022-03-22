const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const addUser = require("../../utils/addUser");

const challengeQuery = require("../../../models/challenges");
const challengeModel = firestore.collection("challenges");

// Import fixtures
const userDataArray = require("../../fixtures/user/user")();
const challengeDataArray = require("../../fixtures/challenges/challenges")();
const challengeData = challengeDataArray[0];

describe("Challenges", function () {
  let challengeId;

  beforeEach(async function () {
    challengeId = await challengeQuery.postChallenge(challengeData);
  });
  afterEach(async function () {
    await cleanDb();
  });
  describe("postChallenge", function () {
    it("should add the challenge", async function () {
      const data = (await challengeModel.doc(challengeId).get()).data();

      expect(data.level).to.be.equal(challengeData.level);
      expect(data.title).to.be.equal(challengeData.title);
      expect(data.participants).to.be.a("array").with.lengthOf(0);
      expect(data.is_active).to.be.equal(true);

      expect(data.start_date).to.be.deep.equal({
        _seconds: challengeData.start_date,
        _nanoseconds: 0,
      });
      expect(data.end_date).to.be.deep.equal({
        _seconds: challengeData.end_date,
        _nanoseconds: 0,
      });
    });
  });

  describe("fetchChallenges", function () {
    it("should return all challenges", async function () {
      const response = await challengeQuery.fetchChallenges();

      expect(response).to.be.a("array").with.lengthOf(1);
      expect(response[0].id).to.be.equal(challengeId);
    });
    it("should return a empty array", async function () {
      await cleanDb();
      const response = await challengeQuery.fetchChallenges();

      expect(response).to.be.a("array").with.lengthOf(0);
    });
  });

  describe("subscribeUserToChallenge", function () {
    it("should return challenge reference and populate participants", async function () {
      const userId = await addUser();

      const response = await challengeQuery.subscribeUserToChallenge(userId, challengeId);
      const data = response.data();

      expect(data.level).to.be.equal(challengeData.level);
      expect(data.title).to.be.equal(challengeData.title);
      expect(data.participants).to.be.a("array").with.lengthOf(1);
      expect(data.participants[0]).to.be.equal(userId);
      expect(data.is_active).to.be.equal(true);
    });
  });

  describe("fetchParticipantsData", function () {
    it("should return data of the participants", async function () {
      const userId1 = await addUser();
      const userId2 = await addUser(userDataArray[1]);
      const response = await challengeQuery.fetchParticipantsData([userId1, userId2]);

      expect(response).to.be.a("array").of.lengthOf(2);
      for (const user of response) {
        expect(user.email).to.be.equal(undefined);
        expect(user.phone).to.be.equal(undefined);
      }
    });
  });
});
