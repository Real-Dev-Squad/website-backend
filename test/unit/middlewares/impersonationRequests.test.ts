import chai from "chai";
import sinon from "sinon";
import {
  createImpersonationRequestValidator,
  impersonationSessionValidator
} from "../../../middlewares/validators/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  ImpersonationRequestResponse,
} from "../../../types/impersonationRequest";
import { Request, Response } from "express";
import { ImpersonationRequestResponse, ImpersonationSessionRequest } from "../../../types/impersonationRequest";

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

    describe("impersonationSessionValidator", function(){
     it("should validate for a valid impersonation session request", async function () {
      req = {
        query: {action:"START", dev:"true"}
      };
      await impersonationSessionValidator(req as ImpersonationSessionRequest,res as ImpersonationRequestResponse, nextSpy);
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should not validate for an invalid session request on missing action", async function () {
      req = {
        query:{action:""}
      };
      await impersonationSessionValidator(req as  ImpersonationSessionRequest,res as ImpersonationRequestResponse, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });

    it("should invalidate if action field is not of correct type", async function () {
      req = {
        query:{action:"ACTIVE",dev:"true"}
      };
      await impersonationSessionValidator(req as ImpersonationSessionRequest,res as ImpersonationRequestResponse, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });
  })
});