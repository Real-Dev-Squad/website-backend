import chai from "chai";
import sinon from "sinon";
import {
  createImpersonationRequestValidator,
  getImpersonationRequestsValidator
} from "../../../middlewares/validators/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  ImpersonationRequestResponse,
  GetImpersonationControllerRequest,
} from "../../../types/impersonationRequest";
import { Request, Response } from "express";

const { expect } = chai;

describe("Impersonation Request Validators", function () {
  let req: Partial<Request>;
  let res: Partial<Response> & {
    boom: { badRequest: sinon.SinonSpy };
  };
  let nextSpy: sinon.SinonSpy;
  const requestBody: CreateImpersonationRequestBody = {
    impersonatedUserId: "randomId",
    reason: "Testing purpose",
  };

  beforeEach(function () {
    res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    nextSpy = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createImpersonationRequestValidator", function () {
    it("should validate for a valid create impersonation request", async function () {
      req = {
        body: requestBody,
      };
      await createImpersonationRequestValidator(
        req as CreateImpersonationRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should not validate for an invalid impersonation request on missing impersonatedUserId", async function () {
      req = {
        body: { ...requestBody, impersonatedUserId: "" },
      };
      await createImpersonationRequestValidator(
        req as CreateImpersonationRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });

    it("should not validate for an invalid impersonation request on missing reason", async function () {
      req = {
        body: { ...requestBody, reason: "" },
      };
      await createImpersonationRequestValidator(
        req as CreateImpersonationRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });
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
        req as GetImpersonationControllerRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });
  });
});