const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const discordQuery = require("../../../models/discord");
const discordData = require("../../fixtures/discord/discord")();

describe("discord", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("addDiscordData", function () {
    it("should add discord data to discord firestore collection", async function () {
      const response = await discordQuery.addDiscordData(discordData[0]);

      expect(response).to.be.an("object");
      expect(response.message).to.equal("Added data successfully");
    });
  });
});
