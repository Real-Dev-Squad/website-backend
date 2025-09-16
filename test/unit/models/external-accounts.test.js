import { expect } from "chai";
import cleanDb from "../../utils/cleanDb.js";
import * as externalAccountsModel from "../../../models/external-accounts.js";
import externalAccountData from "../../fixtures/external-accounts/external-accounts.js";

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
      const response = await externalAccountsModel.fetchExternalAccountData("", externalAccountData[2].token);

      expect(response).to.be.an("object");
      expect(response).to.have.property("id");
      expect(response).to.have.property("type");
      expect(response).to.have.property("token");
      expect(response).to.have.property("attributes");
      expect(response.type).to.equal(externalAccountData[2].type);
      expect(response.token).to.equal(externalAccountData[2].token);
      expect(response.attributes).to.be.eql({
        discordId: externalAccountData[2].attributes.discordId,
        discordJoinedAt: externalAccountData[2].attributes.discordJoinedAt,
        expiry: externalAccountData[2].attributes.expiry,
        userName: externalAccountData[2].attributes.userName,
        discriminator: externalAccountData[2].attributes.discriminator,
        userAvatar: externalAccountData[2].attributes.userAvatar,
      });
    });

    it("should return undefined id when no data found", async function () {
      const response = await externalAccountsModel.fetchExternalAccountData("", externalAccountData[0].token);

      expect(response).to.be.an("object");
      expect(response.id).to.be.equal(undefined);
    });
  });
});
