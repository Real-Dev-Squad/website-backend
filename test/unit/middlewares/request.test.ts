import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import { createRequestsMiddleware } from "./../../../middlewares/validators/requests";
import { validOooStatusRequests, invalidOooStatusRequests } from "./../../fixtures/oooStatusRequest/oooStatusRequest";

describe("OOO Status Request Validators", function () {
  describe("createRequestsMiddleware", function () {
    it("should pass validation for a valid create request", async function () {
      const req = {
        body: validOooStatusRequests,
        userData: {
          id: "user123",
        },
      };
      const res = {};
      const nextSpy = sinon.spy();

      await createRequestsMiddleware(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid create request", async function () {
      const req = {
        body: invalidOooStatusRequests,
        userData: {
          id: "someUserId",
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextSpy = sinon.spy();

      await createRequestsMiddleware(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });
});
