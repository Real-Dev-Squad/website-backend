const chai = require("chai");
const { expect } = chai;

const addUser = require("../../utils/addUser");
const addBadges = require("../../utils/addBadges");
const cleanDb = require("../../utils/cleanDb");
const badges = require("../../../models/badges");
const userDataArray = require("../../fixtures/user/user")();
const badgesDataArray = require("../../fixtures/badges/badges")();

describe("badges", function () {
  let userID;
  beforeEach(async function () {
    userID = await addUser();
    await addBadges({ userID });
  });
  afterEach(async function () {
    await cleanDb();
  });

  describe("fetchBadges", function () {
    it("should return all the badges", async function () {
      const response = await badges.fetchBadges({});
      const result = response[0];
      const expectedData = {
        ...badgesDataArray[0],
        users: [userID],
      };
      expect(response).to.be.a("array");
      Object.keys(result).forEach(function (key) {
        expect(result[parseInt(key) || key]).to.be.deep.equal(expectedData[parseInt(key) || key]);
      });
    });
  });

  describe("fetchUserBadges", function () {
    it("should return badges to user base on username", async function () {
      const response = await badges.fetchUserBadges(userDataArray[0].username);

      expect(response).to.be.a("object");
      expect(response.userExists).to.be.equal(true);
      expect(response.userBadges[0]).to.be.deep.equal({
        title: badgesDataArray[0].title,
        description: badgesDataArray[0].description,
      });
    });

    it("should return empty badges if username does not exist", async function () {
      const response = await badges.fetchUserBadges("undefined");
      expect(response).to.be.a("object");
      expect(response.userExists).to.be.equal(false);
      expect(response.userBadges).of.length(0);
    });
  });
});
