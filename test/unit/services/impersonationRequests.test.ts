import { expect } from "chai";
import sinon from "sinon";
import * as impersonationService from "../../../services/impersonationRequests";
import * as impersonationModel from "../../../models/impersonationRequests";
import * as logService from "../../../services/logService";
import { REQUEST_DOES_NOT_EXIST, TASK_REQUEST_MESSAGES } from "../../../constants/requests";
import userDataFixture from "../../fixtures/user/user";
import { impersonationRequestsBodyData } from "../../fixtures/impersonation-requests/impersonationRequests";
import { CreateImpersonationRequestModelDto } from "../../../types/impersonationRequest";
import { Timestamp } from "firebase-admin/firestore";

const authService = require("../../../services/authService");
const userQuery = require("../../../models/users");

describe("Tests Impersonation Requests Service", () => {
  let mockRequestBody: CreateImpersonationRequestModelDto = impersonationRequestsBodyData[0];
  const userData = userDataFixture();

  afterEach(() => {
    sinon.restore();
  });

  describe("createImpersonationRequestService", () => {
    it("should return NotFound error with USER_NOT_FOUND if userId does not exist", async () => {
      sinon.stub(userQuery, "fetchUser").returns({ userExists: false });

      try {
        await impersonationService.createImpersonationRequestService({
          userId: "randomIs",
          createdBy: "randomName",
          impersonatedUserId: "randomImpersonatedId",
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
        impersonatedUserId: userData[20].id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      sinon.stub(userQuery, "fetchUser").returns({ userExists: true, user: userData[20] });
      sinon.stub(logService, "addLog").resolves();

      const response = await impersonationService.createImpersonationRequestService({
        userId: mockRequestBody.userId,
        createdBy: mockRequestBody.createdBy,
        impersonatedUserId: userData[20].id,
        reason: mockRequestBody.reason,
      });

      expect(response).to.not.be.null;
      expect(response.createdBy).to.equal(mockRequestBody.createdBy);
      expect(response.id).to.not.be.null;
      expect(response.userId).to.equal(mockRequestBody.userId);
      expect(response.impersonatedUserId).to.equal(userData[20].id);
    });

    it("should throw error when createImpersonationRequestService fails", async () => {
      sinon.stub(userQuery, "fetchUser").throws(new Error("error"));

      try {
        await impersonationService.createImpersonationRequestService({
          userId: mockRequestBody.userId,
          createdBy: mockRequestBody.createdBy,
          impersonatedUserId: "112",
          reason: mockRequestBody.reason,
        });
      } catch (error) {
        expect(error.message).to.equal("error");
      }
    });
  });

  describe("startImpersonationService", () => {
    it("should return 403 Forbidden if an unauthorized user tries to start the impersonation session", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      try {
        await impersonationService.startImpersonationService({ userId: "randomId", requestId: "123" });
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal("You are not allowed for this operation at the moment");
      }
    });

    it("should return 403 Forbidden if a request has already been impersonated", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        isImpersonationFinished: true,
        status: "APPROVED",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      try {
        await impersonationService.startImpersonationService({ userId: "randomId", requestId: "123" });
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal("You are not allowed for this operation at the moment");
      }
    });

    it("should return 403 Forbidden if a request has not been APPROVED", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        isImpersonationFinished: false,
        status: "REJECTED",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      try {
        await impersonationService.startImpersonationService({ userId: "randomId", requestId: "123" });
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal("You are not allowed for this operation at the moment");
      }
    });

    it("should successfully update the request with startedAt, endedAt and isImpersonationFinished=true", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        status: "APPROVED",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      sinon.stub(impersonationModel, "updateImpersonationRequest").resolves({
        id: "123",
        lastModifiedBy: "testUserId",
        startedAt: Timestamp.now(),
        endedAt: Timestamp.now(),
        isImpersonationFinished: true
      });

      const response = await impersonationService.startImpersonationService({
        userId: "testUserId",
        requestId: "123"
      });

      expect(response).to.not.be.null;
      expect(response.updatedRequest.isImpersonationFinished).to.equal(true);
      expect(response.updatedRequest.startedAt).to.not.be.null;
      expect(response.updatedRequest.endedAt).to.not.be.null;
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
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      try {
        await impersonationService.stopImpersonationService({ userId: "randomId", requestId: "123" });
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal("You are not authorized for this action");
      }
    });

    it("should successfully update the request with endedAt and lastModifiedBy", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        impersonatedUserId: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      sinon.stub(impersonationModel, "updateImpersonationRequest").resolves({
        id: "123",
        lastModifiedBy: "testUserId",
        endedAt: Timestamp.now()
      });

      const response = await impersonationService.stopImpersonationService({
        userId: "testUserId",
        requestId: "123"
      });

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

    it("should generate a jwt token when the action is START", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        impersonatedUserId: "testUserId2",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      sinon.stub(authService, "generateImpersonateAuthToken").resolves("mockToken123");

      const response = await impersonationService.generateImpersonationTokenService("123", "START");

      expect(response.name).to.equal(config.get("userToken.cookieName"));
      expect(response.value).to.equal("mockToken123");
    });

    it("should generate a jwt token when the action is STOP", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        impersonatedUserId: "testUserId2",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      sinon.stub(authService, "generateAuthToken").resolves("mockToken123");

      const response = await impersonationService.generateImpersonationTokenService("123", "STOP");

      expect(response.name).to.equal(config.get("userToken.cookieName"));
      expect(response.value).to.equal("mockToken123");
    });

    it("should return 403 Forbidden if action is neither START nor STOP", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        userId: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));

      try {
        await impersonationService.generateImpersonationTokenService("123", "ACTIVE");
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal("Action can be only START/STOP");
      }
    });
  });
});
