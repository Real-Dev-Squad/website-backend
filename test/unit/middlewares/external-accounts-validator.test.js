const Sinon = require("sinon");
const { externalAccountData, postExternalAccountsUsers } = require("../../../middlewares/validators/external-accounts");
const { EXTERNAL_ACCOUNTS_POST_ACTIONS } = require("../../../constants/external-accounts");
const { expect } = require("chai");

describe("Middleware | Validators | external accounts", function () {
  describe("externalAccountsData", function () {
    it("allows the request to pass to next function", async function () {
      const req = {
        body: {
          type: "some type",
          token: "some token",
          attributes: {},
        },
      };
      const res = {};
      const nextSpy = Sinon.spy();
      await externalAccountData(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("stops the propogation of request to the next function", async function () {
      const req = {
        body: {},
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      await externalAccountData(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });

  describe("postExternalAccountsUsers", function () {
    it("should be successful when valid query params are passed", async function () {
      const req = {
        query: { action: EXTERNAL_ACCOUNTS_POST_ACTIONS.DISCORD_USERS_SYNC },
      };
      const res = {};
      const nextSpy = Sinon.spy();
      await postExternalAccountsUsers(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should be respond with bad request when invalid query params are passed", async function () {
      const req = {
        query: { action: "abc" },
      };
      const res = {
        boom: {
          badRequest: Sinon.spy(),
        },
      };
      const nextSpy = Sinon.spy();
      await postExternalAccountsUsers(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
  });
});
