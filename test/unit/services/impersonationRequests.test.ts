import { expect } from "chai";
import sinon from "sinon";
import * as impersonationService from "../../../services/impersonationRequests";
import * as impersonationModel from "../../../models/impersonationRequests";
import * as logService from "../../../services/logService";
import {
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_STATE,
  TASK_REQUEST_MESSAGES,
  ERROR_WHILE_UPDATING_REQUEST,
  OPERATION_NOT_ALLOWED
} from "../../../constants/requests";
import userDataFixture from "../../fixtures/user/user";
import { impersonationRequestsBodyData } from "../../fixtures/impersonation-requests/impersonationRequests";
import { CreateImpersonationRequestModelDto, ImpersonationRequest } from "../../../types/impersonationRequest";
import { Timestamp } from "firebase-admin/firestore";
import addUser from "../../utils/addUser";
import cleanDb from "../../utils/cleanDb";
import config from "config";
import * as authService from "../../../services/authService";
import * as userQuery from "../../../models/users";
const userData = userDataFixture();
import logger from "../../../utils/logger";

describe("Tests Impersonation Requests Service", () => {
  const mockRequestBody: CreateImpersonationRequestModelDto = impersonationRequestsBodyData[0];
  let impersonationRequest;
  let testUserId;
  const dummyImpersonationRequest:ImpersonationRequest = {
      id: "123",
      ...impersonationRequestsBodyData[2],
      reason: "He asked",
      createdBy: "testUserId",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

  afterEach(async () => {
    await cleanDb();
    sinon.restore();
  });

  describe("createImpersonationRequestService", () => {
    it("should return NotFound error with USER_NOT_FOUND if createdBy does not exist", async () => {
      sinon.stub(userQuery, "fetchUser").resolves({
        userExists: false,
        user: function <userModel>() {
          throw new Error("Function not implemented.");
        }
      });

      try {
        await impersonationService.createImpersonationRequestService({
          createdBy: "randomIs",
          createdFor: "randomImpersonatedId",
          reason: "He asked",
        });
      } catch (err) {
        expect(err.name).to.equal("NotFoundError");
        expect(err.message).to.equal(TASK_REQUEST_MESSAGES.USER_NOT_FOUND);
      }
    });

    it("should successfully create a new impersonation Request", async () => {
      sinon.stub(impersonationModel, "createImpersonationRequest").returns(Promise.resolve({
        id: "123",
        ...mockRequestBody,
        createdFor: userData[20].id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      sinon.stub(userQuery, "fetchUser").resolves({ userExists: true, user: userData[20] });

      sinon.stub(logService, "addLog").resolves();

      const response = await impersonationService.createImpersonationRequestService({
        createdBy: mockRequestBody.createdBy,
        createdFor: userData[20].id,
        reason: mockRequestBody.reason,
      });

      expect(response).to.not.be.null;
      expect(response.id).to.not.be.null;
      expect(response.createdBy).to.equal(mockRequestBody.createdBy);
      expect(response.createdFor).to.equal(userData[20].id);
    });

    it("should throw error when createImpersonationRequestService fails", async () => {
      sinon.stub(userQuery, "fetchUser").throws(new Error("error"));

      try {
        await impersonationService.createImpersonationRequestService({
          createdBy: mockRequestBody.createdBy,
          createdFor: "112",
          reason: mockRequestBody.reason,
        });
      } catch (error) {
        expect(error.message).to.equal("error");
      }
    });
  });

  describe("updateImpersonationRequestService", () => {
    beforeEach(async () => {
      testUserId = await addUser(userData[20]);
      impersonationRequest = await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[0],
        createdFor: testUserId
      });
    });

    it("should throw NotFound error if request does not exist", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(null));
      try {
        await impersonationService.updateImpersonationRequestService({
          id: "123",
          lastModifiedBy: "testUserId",
          updatePayload: { status: "APPROVED" }
        });
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("NotFoundError");
        expect(err.message).to.equal(REQUEST_DOES_NOT_EXIST);
      }
    });

    it("should throw forbidden error if request is already approved", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        ...impersonationRequestsBodyData[1],
        createdFor: "testUserId",
        id: "123",
        status: "APPROVED",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }));
      sinon.stub(impersonationModel, "createImpersonationRequest").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[1],
        reason: "He asked",
        status: "APPROVED",
        createdFor: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));
      try {
        await impersonationModel.createImpersonationRequest({
          ...impersonationRequestsBodyData[1],
          createdFor: testUserId
        });
        await impersonationService.updateImpersonationRequestService({
          id: "123",
          lastModifiedBy: "testUserId",
          updatePayload: { status: "APPROVED" }
        });
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(OPERATION_NOT_ALLOWED);
      }
    });

    it("should throw forbidden error if request is already rejected", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        ...impersonationRequestsBodyData[1],
        createdFor: "testUserId",
        id: "123",
        status: "REJECTED",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }));
      try {
        await impersonationService.updateImpersonationRequestService({
          id: "123",
          lastModifiedBy: "testUserId",
          updatePayload: { status: "REJECTED" }
        });
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(OPERATION_NOT_ALLOWED);
      }
    });

    it("should throw forbidden error if an unauthorized user tries updating the request", async () => {
      sinon.stub(impersonationModel, "createImpersonationRequest").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[1],
        reason: "He asked",
        status: "REJECTED",
        createdFor: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        ...impersonationRequestsBodyData[1],
        createdFor: "testUserId",
        id: "123",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }));
      try {
        await impersonationModel.createImpersonationRequest({
          ...impersonationRequestsBodyData[1],
          createdFor: testUserId
        });
        await impersonationService.updateImpersonationRequestService({
          id: "123",
          lastModifiedBy: "unauthorizedUserId",
          updatePayload: { status: "APPROVED" }
        });
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(OPERATION_NOT_ALLOWED);
      }
    });

    it("should successfully update an impersonation request status to approved", async () => {
      const response = await impersonationService.updateImpersonationRequestService({
        id: impersonationRequest.id,
        updatePayload: { status: REQUEST_STATE.APPROVED, message: "Testing" },
        lastModifiedBy: testUserId
      });

      expect(response).to.not.be.null;
      expect(response.updatedRequest.status).to.equal(REQUEST_STATE.APPROVED);
      expect(response.updatedRequest.id).to.not.be.null;
      expect(response.returnMessage).to.equal(REQUEST_APPROVED_SUCCESSFULLY);
      expect(response.updatedRequest.message).to.equal("Testing");
    });

    it("should successfully update an impersonation request status to rejected", async () => {
      const response = await impersonationService.updateImpersonationRequestService({
        id: impersonationRequest.id,
        updatePayload: { status: REQUEST_STATE.REJECTED, message: "Testing" },
        lastModifiedBy: testUserId
      });

      expect(response).to.not.be.null;
      expect(response.updatedRequest.status).to.equal(REQUEST_STATE.REJECTED);
      expect(response.updatedRequest.id).to.not.be.null;
      expect(response.returnMessage).to.equal(REQUEST_REJECTED_SUCCESSFULLY);
      expect(response.updatedRequest.message).to.equal("Testing");
    });

    it("should log and throw error if updateImpersonationRequest throws in updateImpersonationRequestService", async () => {
      const error = new Error("Some update error");
      const loggerStub = sinon.stub(logger, "error");
      sinon.stub(impersonationModel, "updateImpersonationRequest").rejects(error);

      const body = {
        id: "someId",
        updatePayload: { status: "APPROVED" },
        lastModifiedBy: "createdBy"
      };

      try {
        await impersonationService.updateImpersonationRequestService(body);
        expect.fail("Should throw error");
      } catch (err) {
        expect(loggerStub.called).to.be.true;
        expect(loggerStub.firstCall.args[0]).to.equal(ERROR_WHILE_UPDATING_REQUEST);
      }
    });
  });

  describe("startImpersonationService", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return 403 Forbidden if an unauthorized user tries to start the impersonation session", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(dummyImpersonationRequest));

    try {
      await impersonationService.startImpersonationService({ userId: "randomId", requestId: "123" });
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("ForbiddenError");
      expect(err.message).to.equal("You are not allowed for this operation at the moment");
    }
  });

  it("should return 403 Forbidden if a request has already been impersonated", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(dummyImpersonationRequest));

    try {
      await impersonationService.startImpersonationService({ userId: "randomId", requestId: "123" });
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("ForbiddenError");
      expect(err.message).to.equal(OPERATION_NOT_ALLOWED);
    }
  });

  it("should return 403 Forbidden if a request has not been APPROVED", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(dummyImpersonationRequest));

    try {
      await impersonationService.startImpersonationService({ userId: "randomId", requestId: "123" });
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("ForbiddenError");
      expect(err.message).to.equal(OPERATION_NOT_ALLOWED);
    }
  });

  it("should successfully update the request body with startedAt, endedAt and isImpersonation as true", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({...dummyImpersonationRequest,status:"APPROVED"}));

    sinon.stub(impersonationModel, "updateImpersonationRequest").resolves({
      id: "123",
      lastModifiedBy: "testUserId",
      startedAt: Timestamp.now(),
      endedAt: Timestamp.now(),
      isImpersonationFinished: true
    });

    const response = await impersonationService.startImpersonationService({ userId: "testUserId", requestId: "123" });
    expect(response).to.not.be.null;
    expect(response.updatedRequest.isImpersonationFinished).to.equal(true);
    expect(response.updatedRequest.startedAt).to.not.be.null;
    expect(response.updatedRequest.endedAt).to.not.be.null;
  });

  it("should throw 404 NotFound error if a request does not exist", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(null));

    try {
      await impersonationService.startImpersonationService({ userId: "randomId", requestId: "123" });
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("NotFoundError");
      expect(err.message).to.equal(REQUEST_DOES_NOT_EXIST);
    }
  });
});

describe("stopImpersonationService", () => {
  it("should throw 404 NotFound error if a request does not exist", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(null));

    try {
      await impersonationService.stopImpersonationService({ userId: "randomId", requestId: "123" });
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("NotFoundError");
      expect(err.message).to.equal(REQUEST_DOES_NOT_EXIST);
    }
  });

  it("should throw 403 Forbidden if an unauthorized user tries to stop impersonation", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(dummyImpersonationRequest));

    try {
      await impersonationService.stopImpersonationService({ userId: "randomId", requestId: "123" });
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("ForbiddenError");
      expect(err.message).to.equal(OPERATION_NOT_ALLOWED);
    }
  });

  it("should successfully update the request body with endedAt and lastModifiedBy", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({...dummyImpersonationRequest,status:"APPROVED",createdFor:"testUserId"}));

    sinon.stub(impersonationModel, "updateImpersonationRequest").resolves({
      id: "123",
      lastModifiedBy: "testUserId",
      endedAt: Timestamp.now()
    });

    const response = await impersonationService.stopImpersonationService({ userId: "testUserId", requestId: "123" });
    expect(response).to.not.be.null;
    expect(response.updatedRequest.lastModifiedBy).to.equal("testUserId");
    expect(response.updatedRequest.endedAt).to.not.be.null;
    expect(response.updatedRequest.id).to.equal("123");
  });
});

describe("generateImpersonationTokenService", () => {
  it("should return 404 NotFound if a request does not exist", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(null));

    try {
      await impersonationService.generateImpersonationTokenService("123", "START");
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("NotFoundError");
      expect(err.message).to.equal(REQUEST_DOES_NOT_EXIST);
    }
  });

  it("should generate jwt token for impersonation when the action is START", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(dummyImpersonationRequest));

    sinon.stub(authService.default, "generateImpersonationAuthToken").returns("mockToken123");

    const response = await impersonationService.generateImpersonationTokenService("123", "START");

    expect(response.name).to.equal(config.get("userToken.cookieName"));
    expect(response.value).to.equal("mockToken123");
  });

  it("should generate jwt token for stopping impersonation when the action is STOP", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(dummyImpersonationRequest));

    sinon.stub(authService, "generateAuthToken").resolves("mockToken123");

    const response = await impersonationService.generateImpersonationTokenService("123", "STOP");

    expect(response.name).to.equal(config.get("userToken.cookieName"));
    expect(response.value).to.equal("mockToken123");
  });

  it("should return 403 Forbidden if invalid action type is passed", async () => {
    sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(dummyImpersonationRequest));

    try {
      await impersonationService.generateImpersonationTokenService("123", "ACTIVE");
    } catch (err) {
      expect(err).to.not.be.undefined;
      expect(err.name).to.equal("BadRequestError");
      expect(err.message).to.equal("Invalid 'action' parameter: must be either 'START' or 'STOP'");
    }
  });
 });
});
