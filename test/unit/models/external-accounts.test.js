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
});
