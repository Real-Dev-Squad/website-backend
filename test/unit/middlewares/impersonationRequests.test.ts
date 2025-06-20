import chai from "chai";
import sinon from "sinon";
import { getImpersonationRequestsValidator } from "../../../middlewares/validators/impersonationRequests";
import { Request, Response } from "express";
import { ImpersonationRequestResponse } from "../../../types/impersonationRequest";

const { expect } = chai;

describe("Impersonation Request Validators", function () {
  let req: Partial<Request>;
  let res: Partial<Response> & {
    boom: { badRequest: sinon.SinonSpy };
  };
  let nextSpy: sinon.SinonSpy;

  beforeEach(function () {
    res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    nextSpy = sinon.spy();
  });

  describe("getImpersonationRequestsValidator", function () {
    it("should validate for a valid get impersonation requests query", async function () {
      req = {
        query: {
          dev: "true",
          status: "APPROVED",
        },
      };
      await getImpersonationRequestsValidator(
        req as any,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should validate a request with partial query", async function () {
      req = {
        query: {
          dev: "true",
        },
      };
      await getImpersonationRequestsValidator(
        req as any,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should not validate for an invalid status in query", async function () {
      req = {
        query: {
          dev: "true",
          status: "INVALID_STATUS",
        },
      };
      await getImpersonationRequestsValidator(
        req as any,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });
  });
});