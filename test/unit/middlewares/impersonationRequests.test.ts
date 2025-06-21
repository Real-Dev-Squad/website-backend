import chai from "chai";
import sinon from "sinon";
import {
  updateImpersonationRequestValidator,
} from "../../../middlewares/validators/impersonationRequests";
import {
  ImpersonationRequestResponse,
  UpdateImpersonationRequest,
  UpdateImpersonationRequestStatusBody,
} from "../../../types/impersonationRequest";
import { Request, Response } from "express";

const { expect } = chai;

describe("Impersonation Request Validators", function () {
  let req: Partial<Request>;
  let res: Partial<Response> & {
    boom: { badRequest: sinon.SinonSpy };
  };
  let nextSpy: sinon.SinonSpy;
  const updateRequestBody: UpdateImpersonationRequestStatusBody = {
    status: "APPROVED",
    message: "Testing",
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

  describe("updateImpersonationRequestValidator", function () {
    it("should validate for a valid update impersonation request", async function () {
      req = {
        body: updateRequestBody,
      };
      await updateImpersonationRequestValidator(
        req as UpdateImpersonationRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should not validate for an invalid update impersonation request on missing status", async function () {
      req = {
        body: { ...updateRequestBody, status: "" },
      };
      await updateImpersonationRequestValidator(
        req as UpdateImpersonationRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });

    it("should invalidate if status field is not of correct type", async function () {
      req = {
        body: { ...updateRequestBody, status: "ACTIVE" },
      };
      await updateImpersonationRequestValidator(
        req as UpdateImpersonationRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });
  });
});