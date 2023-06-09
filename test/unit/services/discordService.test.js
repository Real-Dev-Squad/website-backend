const sinon = require("sinon");
const { expect } = require("chai");

const discordServiceMock = require("../../fixtures/discordResponse/discord-response");
const discordService = require("../../../services/discordService");

describe("discord service", function () {
  describe("Returns appropriate response", function () {
    beforeEach(function () {
      sinon.stub(discordService, "getDiscordMembers").returns(discordServiceMock.getDiscordMembers);
    });
    it("Tests discord service response", async function () {
      const response = await discordService.getDiscordMembers();
      expect(response).to.have.length(1);
      expect(response[0]).to.have.all.keys(Object.keys(discordServiceMock.getDiscordMembers[0]));
    });
  });
});
