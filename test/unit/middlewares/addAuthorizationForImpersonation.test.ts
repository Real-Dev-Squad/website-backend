import { expect } from "chai";
import sinon from "sinon";
import { Request, Response, NextFunction } from "express";
import { addAuthorizationForImpersonation } from "../../../middlewares/addAuthorizationForImpersonation";
import { ImpersonationRequestResponse, ImpersonationSessionRequest } from "../../../types/impersonationRequest";

describe("addAuthorizationForImpersonation", () => {
  let req;
  let res: Partial<Response> & {
    boom: {
      badRequest: sinon.SinonSpy;
      unauthorized: sinon.SinonSpy;
      badImplementation: sinon.SinonSpy;
    };
  };
  let next: sinon.SinonSpy;
  let boomBadRequest: sinon.SinonSpy;

  beforeEach(() => {
    boomBadRequest = sinon.spy();

    req = {
      query: {},
      userData: {
        roles: {
          super_user: true,
        },
      },
    };

    res = {
      boom: {
        badRequest: boomBadRequest,
        badImplementation: sinon.spy(),
        unauthorized: sinon.spy(),
      },
    };

    next = sinon.spy();
  });

  it("should call next when user has SUPERUSER role and action is START", () => {
    req.query = { action: "START" };

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next as NextFunction
    );

    expect(next.calledOnce).to.be.true;
    expect(boomBadRequest.notCalled).to.be.true;
  });

  it("should not call next if user lacks SUPERUSER role", () => {
    req.query = { action: "START" };
    req.userData = { roles: {} };

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(res.boom.unauthorized.calledOnce).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should call next directly for action=END", () => {
    req.query = { action: "END" };

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(next.calledOnce).to.be.true;
  });

  it("should call badRequest for invalid action", () => {
    req.query = { action: "INVALID" };

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(boomBadRequest.calledOnce).to.be.true;
    expect(boomBadRequest.firstCall.args[0]).to.equal("Invalid or missing action");
    expect(next.notCalled).to.be.true;
  });

  it("should call badRequest if action is missing", () => {
    req.query = {};

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(boomBadRequest.calledOnce).to.be.true;
    expect(boomBadRequest.firstCall.args[0]).to.equal("Invalid or missing action");
    expect(next.notCalled).to.be.true;
  });
});
