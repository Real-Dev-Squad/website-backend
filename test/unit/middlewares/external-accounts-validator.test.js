const Sinon = require("sinon");
const { externalAccountData } = require("../../../middlewares/validators/external-accounts");
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
});
