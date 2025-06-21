import { expect } from "chai";
import sinon from "sinon";
import * as impersonationService from "../../../services/impersonationRequests";
import * as impersonationModel from "../../../models/impersonationRequests";
import {
  ERROR_WHILE_CREATING_REQUEST,
  REQUEST_ALREADY_APPROVED,
  REQUEST_ALREADY_REJECTED,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_STATE,
  UNAUTHORIZED_TO_UPDATE_REQUEST,
} from "../../../constants/requests";
import userDataFixture from "./../../fixtures/user/user";
const userData = userDataFixture();
import addUser from "../../utils/addUser";
import cleanDb from "../../utils/cleanDb";
import { NotFound } from "http-errors";
import {
  impersonationRequestsBodyData,
} from "../../fixtures/impersonation-requests/impersonationRequests";
import { createImpersonationRequest } from "../../../models/impersonationRequests";
import { Timestamp } from "firebase-admin/firestore";
const logger = require("../../../utils/logger");

describe("Tests Impersonation Requests Service", () => {
  let testUserId: string;
  let impersonationRequest;

  afterEach(async () => {
    await cleanDb();
    sinon.restore();
  });

  describe("validateUpdateImpersonationRequestService", () => {
    it("should throw NotFound error if request does not exist", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve(null));
      try {
        await impersonationService.validateUpdateImpersonationRequestService("impersonationRequest.id", testUserId);
      } catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("NotFoundError");
        expect(err.message).to.equal(REQUEST_DOES_NOT_EXIST);
      }
    });

    it("should throw forbidden error if request is already approved", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        ...impersonationRequestsBodyData[1],
        impersonatedUserId: "testUserId",
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
        impersonatedUserId: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));
      try {
        const dummyRequest = await createImpersonationRequest({ ...impersonationRequestsBodyData[1], impersonatedUserId: testUserId, status: REQUEST_STATE.APPROVED });
        await impersonationService.validateUpdateImpersonationRequestService(dummyRequest.id, testUserId);
      }
      catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(REQUEST_ALREADY_APPROVED);
      }
    });

    it("should throw forbidden error if request is already rejected", async () => {
      try {
        sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
          ...impersonationRequestsBodyData[1],
          impersonatedUserId: "testUserId",
          id: "123",
          status: "REJECTED",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }));
        sinon.stub(impersonationModel, "createImpersonationRequest").returns(Promise.resolve({
          id: "123",
          ...impersonationRequestsBodyData[1],
          reason: "He asked",
          status: "REJECTED",
          impersonatedUserId: "testUserId",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));
        const dummyRequest = await createImpersonationRequest({ ...impersonationRequestsBodyData[1], impersonatedUserId: testUserId, status: REQUEST_STATE.REJECTED });
        await impersonationService.validateUpdateImpersonationRequestService(dummyRequest.id, testUserId);
      }
      catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(REQUEST_ALREADY_REJECTED);
      }
    });

    it("should throw forbidden error if an unauthorized user tries updating the request", async () => {
      sinon.stub(impersonationModel, "createImpersonationRequest").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[1],
        reason: "He asked",
        status: "REJECTED",
        impersonatedUserId: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        ...impersonationRequestsBodyData[1],
        impersonatedUserId: "testUserId",
        id: "123",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }));
      try {
        const dummyRequest = await createImpersonationRequest({ ...impersonationRequestsBodyData[1], impersonatedUserId: testUserId });
        await impersonationService.validateUpdateImpersonationRequestService(dummyRequest.id, "dummyId");
      }
      catch (err) {
        expect(err).to.not.be.undefined;
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(UNAUTHORIZED_TO_UPDATE_REQUEST);
      }
    });

    it("should be undefined if all validation checks pass", async () => {
      sinon.stub(impersonationModel, "getImpersonationRequestById").returns(Promise.resolve({
        id: "123",
        ...impersonationRequestsBodyData[2],
        reason: "He asked",
        impersonatedUserId: "testUserId",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));
      const response = await impersonationService.validateUpdateImpersonationRequestService("123", "testUserId");
      expect(response).to.undefined;
    });
  });

  describe("updateImpersonationRequestServie", () => {
    beforeEach(async () => {
      impersonationRequest = await createImpersonationRequest({ ...impersonationRequestsBodyData[0], impersonatedUserId: testUserId });
      testUserId = await userData[20];
    });

    afterEach(async () => {
      await sinon.restore();
      await cleanDb();
    });

    it("should successfully update an impersonation request status to approved", async () => {
      const response = await impersonationService.updateImpersonationRequestServie({
        id: impersonationRequest.id,
        updatingBody: { status: REQUEST_STATE.APPROVED, message: "Testing" },
        lastModifiedBy: testUserId
      });

      expect(response).to.not.be.null;
      expect(response.updatedRequest.status).to.equal(REQUEST_STATE.APPROVED);
      expect(response.updatedRequest.id).to.not.be.null;
      expect(response.returnMessage).to.equal(REQUEST_APPROVED_SUCCESSFULLY);
      expect(response.updatedRequest.message).to.equal("Testing");
    });

    it("should successfully update an impersonation request status to rejected", async () => {
      const response = await impersonationService.updateImpersonationRequestServie({
        id: impersonationRequest.id,
        updatingBody: { status: REQUEST_STATE.REJECTED, message: "Testing" },
        lastModifiedBy: testUserId
      });

      expect(response).to.not.be.null;
      expect(response.updatedRequest.status).to.equal(REQUEST_STATE.REJECTED);
      expect(response.updatedRequest.id).to.not.be.null;
      expect(response.returnMessage).to.equal(REQUEST_REJECTED_SUCCESSFULLY);
      expect(response.updatedRequest.message).to.equal("Testing");
    });

    it("should log and throw error if updateImpersonationRequest throws in updateImpersonationRequestServie", async () => {
      const error = new Error("Some update error");
      const loggerStub = sinon.stub(logger, "error");
      sinon.stub(impersonationModel, "updateImpersonationRequest").rejects(error);

      const body = {
        id: "someId",
        updatingBody: { status: "APPROVED" },
        lastModifiedBy: "userId"
      };

      try {
        await impersonationService.updateImpersonationRequestServie(body);
        expect.fail("Should throw error");
      } catch (err) {
        expect(loggerStub.calledWith(ERROR_WHILE_CREATING_REQUEST, err)).to.true;
      }

      sinon.restore();
    });
  });
});