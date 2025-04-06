import { expect } from "chai";
import sinon from "sinon";

import { validateGetQueryParams } from "../../../middlewares/validators/userStatus.js";

describe("Middleware | Validators | userStatus", function () {
  describe("validateRequestQuery", function () {
    it("lets the request pass to the next function for a valid query", async function () {
      const res = {};
      const req = {
        query: {
          state: "IDLE",
        },
      };
      const nextSpy = sinon.spy();
      await validateGetQueryParams(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);

      delete req.query.state;
      req.query.aggregate = true;
      await validateGetQueryParams(req, res, nextSpy);
      expect(nextSpy.calledTwice).to.be.equal(true);
    });

    it("stops the propogation of the event to next function", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
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
