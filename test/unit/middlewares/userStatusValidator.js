const Sinon = require("sinon");
const { expect } = require("chai");
const { validateGetQueryParams } = require("../../../middlewares/validators/userStatus");

describe("Middleware | Validators | userStatus", function () {
  describe("validateRequestQuery", function () {
    it("lets the request pass to the next function for a valid query", async function () {
      const res = {};
      const req = {
        query: {
          state: "IDLE",
        },
      };
      const nextSpy = Sinon.spy();
      await validateGetQueryParams(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);

      delete req.query.state;
      req.query.batch = true;
      await validateGetQueryParams(req, res, nextSpy);
      expect(nextSpy.calledTwice).to.be.equal(true);
    });

    it("stops the propogation of the event to next function", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      const req = {
        query: {
          taskStatus: "invalidKey",
        },
      };
      await validateGetQueryParams(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
});
