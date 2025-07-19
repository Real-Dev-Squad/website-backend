import { expect } from "chai";
import sinon from "sinon";
import { NextFunction, Response } from "express";
import { addAuthorizationForImpersonation } from "../../../middlewares/addAuthorizationForImpersonation";
import { ImpersonationRequestResponse, ImpersonationSessionRequest } from "../../../types/impersonationRequest";
import { INVALID_ACTION_PARAM, OPERATION_NOT_ALLOWED } from "../../../constants/requests";

describe("addAuthorizationForImpersonation", () => {
  let req;
  let res: Partial<Response> & {
    boom: {
      badRequest: sinon.SinonSpy;
      unauthorized: sinon.SinonSpy;
      forbidden: sinon.SinonSpy;
      badImplementation: sinon.SinonSpy;
    };
  };
  let next: sinon.SinonSpy;
  let boomBadRequest: sinon.SinonSpy;
  let boomForbidden: sinon.SinonSpy;
  let boomUnauthorized: sinon.SinonSpy;

  beforeEach(() => {
    boomBadRequest = sinon.spy();
    boomForbidden = sinon.spy();
    boomUnauthorized = sinon.spy();

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
        forbidden: boomForbidden,
        unauthorized: boomUnauthorized,
      },
    };

    next = sinon.spy();
  });

  it("should call next when user has super_user role and action is START", () => {
    req.query = { action: "START" };

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next as NextFunction
    );

    expect(next.calledOnce).to.be.true;
    expect(boomBadRequest.notCalled).to.be.true;
  });

  it("should not call next if user doesn't have super_user role", () => {
    req.query = { action: "START" };
    req.userData = { roles: {} };

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(boomUnauthorized.calledOnce).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should call next directly for action=STOP if an impersonation session is in progress", () => {
    req.query = { action: "STOP" };
    req.isImpersonating = true;

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(next.calledOnce).to.be.true;
  });

  it("should return 403 Forbidden if action=STOP and an impersonation session is not in progress", () => {
    req.query = { action: "STOP" };
    req.isImpersonating = false;

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(boomForbidden.calledOnce).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should call badRequest for invalid action", () => {
    req.query = { action: "INVALID" };

    addAuthorizationForImpersonation(
      req as ImpersonationSessionRequest,
      res as ImpersonationRequestResponse,
      next
    );

    expect(boomBadRequest.calledOnce).to.be.true;
    expect(boomBadRequest.firstCall.args[0]).to.equal(INVALID_ACTION_PARAM);
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
    expect(boomBadRequest.firstCall.args[0]).to.equal(INVALID_ACTION_PARAM);
    expect(next.notCalled).to.be.true;
  });
});
