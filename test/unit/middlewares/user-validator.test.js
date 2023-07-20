const sinon = require("sinon");
const { validateJoinData } = require("./../../../middlewares/validators/user");
const joinData = require("./../../fixtures/user/join");
const { expect } = require("chai");

describe("Middleware | Validators | User", function () {
  describe("Create user validator for validateJoinData", function () {
    it("lets the request pass to next", async function () {
      const req = {
        body: joinData[0],
      };

      const res = {};
      const next = sinon.spy();
      await validateJoinData(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("Stops the propagation of the next", async function () {
      const req = {
        body: {
          firstName: "Neha",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await validateJoinData(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });
  });
});
