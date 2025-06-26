import chai from "chai";
import sinon from "sinon";
import {
  createImpersonationRequestValidator,
  getImpersonationRequestByIdValidator,
  getImpersonationRequestsValidator
} from "../../../middlewares/validators/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  ImpersonationRequestResponse,
  GetImpersonationControllerRequest,
  GetImpersonationRequestByIdRequest,
} from "../../../types/impersonationRequest";
import { Request, Response } from "express";
import { getImpersonationRequestById } from "../../../models/impersonationRequests";

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

  describe("getImpersonationRequestByIdValidator", function () {
    it("should validate for a valid get by id impersonation request", async function () {
      req = {
        params:{
          id:"cuJ7lKT1DFybHNwaMJHu",
          dev:"true"
        }
      }
      await getImpersonationRequestByIdValidator(
        req as GetImpersonationRequestByIdRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );
      expect(nextSpy.calledOnce).to.be.true;
    })

    it("should not validate for a request without dev flag", async function (){
      req = {
        params:{
          id:"192sjsj/dhid"
        }
      }
      await getImpersonationRequestByIdValidator(
        req as GetImpersonationRequestByIdRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );

      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    })

    it("should not validate for a request with missing id", async function(){
      req = {
        params:{
          id:"",
          dev:"true"
        }
      }
      await getImpersonationRequestByIdValidator(
        req as GetImpersonationRequestByIdRequest,
        res as ImpersonationRequestResponse,
        nextSpy
      );

      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    })
  })

  describe("getImpersonationRequestsValidator", function () {
    it("should validate for a valid get impersonation requests query", async function () {
      req = {
        query: {
          dev: "true",
          status: "APPROVED",
        },
      };
      await getImpersonationRequestsValidator(
        req as GetImpersonationControllerRequest,
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
        req as GetImpersonationControllerRequest,
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