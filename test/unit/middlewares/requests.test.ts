import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import {
  createRequestsMiddleware,
  getRequestsMiddleware,
  updateRequestsMiddleware,
} from "../../../middlewares/validators/requests";
import {
  validOooStatusRequests,
  invalidOooStatusRequests,
  validOooStatusUpdate,
  invalidOooStatusUpdate,
} from "../../fixtures/oooRequest/oooRequest";
import { OooRequestCreateRequest, OooRequestResponse } from "../../../types/oooRequest";

describe("Create Request Validators", function () {
  let req: any;
  let res: any;
  let nextSpy;
  beforeEach(function () {
    res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    nextSpy = sinon.spy();
  });
  describe("createRequestsMiddleware", function () {
    it("should pass validation for a valid create request", async function () {
      req = {
        body: validOooStatusRequests,
      };
      res = {};
      await createRequestsMiddleware(req as OooRequestCreateRequest, res as OooRequestResponse, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid create request", async function () {
      req = {
        body: invalidOooStatusRequests,
      };
      res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };

      await createRequestsMiddleware(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });

  describe("Update Request Validator", function () {
    it("Should pass validation for a valid update ooo request", async function () {
      req = {
        body: validOooStatusUpdate,
        query: {
          dev: "true",
        },
      };
      res = {};
      await updateRequestsMiddleware(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("Should throw an error for an invalid update ooo request", async function () {
      req = {
        body: invalidOooStatusUpdate,
        query: {
          dev: "true",
        },
      };
      res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      await updateRequestsMiddleware(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });

  describe("Get Request Validator", function () {
    it("Should pass validation for a valid get request", async function () {
      req = {};
      res = {};
      await getRequestsMiddleware(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("Should throw an error for an invalid get request", async function () {
      req = {
        query: {
          type: "RANDOM",
          state: "RANDOM",
        },
      };
      res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      await getRequestsMiddleware(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });
});
