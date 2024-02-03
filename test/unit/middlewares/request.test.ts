import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import { createRequestsMiddleware } from "./../../../middlewares/validators/requests";
import { validOooStatusRequests, invalidOooStatusRequests } from "../../fixtures/oooRequest/oooRequest";
import { OooRequestCreateRequest, OooRequestResponse } from "../../../types/oooRequest";

describe("OOO Status Request Validators", function () {
  describe("createRequestsMiddleware", function () {
    it("should pass validation for a valid create request", async function () {
      const req = {
        body: validOooStatusRequests,
        query: {
          dev: "true",
        },
      };
      const res = {};
      const nextSpy = sinon.spy();
      await createRequestsMiddleware(req as OooRequestCreateRequest, res as OooRequestResponse, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid create request", async function () {
      const req = {
        body: invalidOooStatusRequests,
        query: {
          dev: "true",
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
