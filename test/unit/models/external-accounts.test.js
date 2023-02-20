const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const externalAccountsModel = require("../../../models/external-accounts");
const externalAccountData = require("../../fixtures/external-accounts/external-accounts")();

describe("External Accounts", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("addExternalAccountData", function () {
    it("should add external account data to firestore collection", async function () {
      const response = await externalAccountsModel.addExternalAccountData(externalAccountData[0]);

      expect(response).to.be.an("object");
      expect(response.message).to.equal("Added data successfully");
    });
  });

  describe("fetchDiscordData", function () {
    it("should return discord data having given token", async function () {
      await externalAccountsModel.addExternalAccountData(externalAccountData[2]);
      const data = await externalAccountsModel.fetchExternalAccountData("", externalAccountData[2].token);
      const response = data[0];

      expect(response).to.be.an("object");
      expect(response).to.have.property("id");
      expect(response).to.have.property("type");
      expect(response).to.have.property("token");
      expect(response).to.have.property("attributes");
      expect(response.type).to.equal(externalAccountData[2].type);
      expect(response.token).to.equal(externalAccountData[2].token);
      expect(response.attributes).to.be.eql({
        discordId: externalAccountData[2].attributes.discordId,
        expiry: externalAccountData[2].attributes.expiry,
      });
    });

    it("should return empty array when no data found", async function () {
      const response = await externalAccountsModel.fetchExternalAccountData("", externalAccountData[0].token);

      expect(response).to.be.an("array");
      expect(response).to.have.length(0);
    });
  });
});
