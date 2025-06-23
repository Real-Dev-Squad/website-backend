import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import * as impersonationModel from "../../../models/impersonationRequests";
import { impersonationRequestsBodyData } from "../../fixtures/impersonation-requests/impersonationRequests";
import { REQUEST_STATE, ERROR_WHILE_CREATING_REQUEST, ERROR_WHILE_UPDATING_REQUEST } from "../../../constants/requests";
import addUser from "../../utils/addUser";
import userDataFixture from "../../fixtures/user/user";
import sinon from "sinon";
import { UpdateImpersonationRequestStatusBody } from "../../../types/impersonationRequest";
import { Timestamp } from "firebase-admin/firestore";
import firestore from "../../../utils/firestore";
const userData = userDataFixture();
const logger = require("../../../utils/logger");

describe("models/impersonationRequests", () => {
  let impersonationRequest;
  let mockRequestBody = impersonationRequestsBodyData[0];
  let testUserId: string;

  beforeEach(async () => {
    await cleanDb();
    testUserId = await addUser(userData[16]);
  });

  afterEach(async () => {
    sinon.restore();
    await cleanDb();
  });

  describe("createImpersonationRequest", () => {
    it("should create a new impersonation request", async () => {
      impersonationRequest = await impersonationModel.createImpersonationRequest(mockRequestBody);
      expect(impersonationRequest).to.have.property("id");
      expect(impersonationRequest).to.include({
        createdBy: mockRequestBody.createdBy,
        impersonatedUserId: mockRequestBody.impersonatedUserId,
        createdFor: mockRequestBody.createdFor,
        status: REQUEST_STATE.PENDING,
      });
    });

    it("should throw an error if there is an existing PENDING impersonation request", async () => {
      await impersonationModel.createImpersonationRequest(mockRequestBody);
      try {
        await impersonationModel.createImpersonationRequest(mockRequestBody);
      } catch (error) {
        expect(error.message).to.include("You are not allowed for this Operation at the moment");
      }
    });

    it("should allow different super users to create requests for same user", async () => {
      const request1 = await impersonationModel.createImpersonationRequest({ ...impersonationRequestsBodyData[0], createdBy: "user1" });
      const request2 = await impersonationModel.createImpersonationRequest({ ...impersonationRequestsBodyData[0], createdBy: "user2", userId: "122" });
      expect(request1).to.have.property("id");
      expect(request1.createdBy).to.equal("user1");
      expect(request1.impersonatedUserId).to.equal(impersonationRequestsBodyData[0].impersonatedUserId);
      expect(request2).to.have.property("id");
      expect(request2.createdBy).to.equal("user2");
      expect(request2.impersonatedUserId).to.equal(impersonationRequestsBodyData[0].impersonatedUserId);
    });

    it("should fail if required fields are missing", async () => {
      try {
        await impersonationModel.createImpersonationRequest({
          ...impersonationRequestsBodyData[0],
          impersonatedUserId: ""
        });
      } catch (error) {
        expect(error.message).to.include(ERROR_WHILE_CREATING_REQUEST);
      }
    });

    it("should throw forbidden error if an APPROVED request with isImpersonationFinished as false is present", async () => {
      try {
        await impersonationModel.createImpersonationRequest({ ...impersonationRequestsBodyData[0], status: REQUEST_STATE.APPROVED });
        await impersonationModel.createImpersonationRequest(impersonationRequestsBodyData[0]);
      } catch (error) {
        expect(error.message).to.include("You are not allowed for this Operation at the moment");
      }
    });
  });

  describe("updateImpersonationRequest", () => {
    beforeEach(async () => {
      impersonationRequest = await impersonationModel.createImpersonationRequest(impersonationRequestsBodyData[0]);
    });

    it("should approve an impersonation request", async () => {
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatePayload: { status: "APPROVED" },
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      }) as UpdateImpersonationRequestStatusBody;
      expect(updatedRequest.status).to.equal(REQUEST_STATE.APPROVED);
    });

    it("should reject an impersonation request", async () => {
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatePayload: { status: "REJECTED" },
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      }) as UpdateImpersonationRequestStatusBody;
      expect(updatedRequest.status).to.equal(REQUEST_STATE.REJECTED);
    });

    it("should change the startedAt, endedAt and isImpersonationFinished fields on update", async () => {
      const updatedBody = {
        isImpersonationFinished: true,
        startedAt: Timestamp.fromDate(new Date(Date.now())),
        endedAt: Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)),
      };
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatePayload: updatedBody,
        lastModifiedBy: impersonationRequest.userId,
      });
      const result = await impersonationModel.getImpersonationRequestById(impersonationRequest.id);
      expect(result.isImpersonationFinished).to.be.true;
      expect(Number(result.startedAt)).to.be.greaterThan(0);
      expect(Number(result.endedAt)).to.be.greaterThan(Number(result.startedAt));
    });

    it("should change updatedAt timestamp on update", async () => {
      const before = Number(impersonationRequest.updatedAt);
      const updated = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatePayload: { status: "APPROVED" },
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      });
      const result = await impersonationModel.getImpersonationRequestById(impersonationRequest.id);
      expect(result).to.not.be.null;
      expect(Number(result.updatedAt)).to.be.greaterThan(before);
    });

    it("should log and throw error if Firestore update fails in updateImpersonationRequest", async () => {
      const error = new Error(ERROR_WHILE_UPDATING_REQUEST);
      const loggerStub = sinon.stub(logger, "error");

      // Stub Firestore collection and doc chain
      const docUpdateStub = sinon.stub().rejects(error);
      const docStub = sinon.stub().returns({ update: docUpdateStub });
      const collectionStub = sinon.stub().returns({ doc: docStub });
      sinon.stub(firestore, "collection").callsFake(collectionStub);

      try {
        await impersonationModel.updateImpersonationRequest({
          id: "impersonationRequest.id",
          updatePayload: { status: "APPROVED" },
          lastModifiedBy: impersonationRequest.impersonatedUserId,
        });
        expect.fail("Should throw error");
      } catch (err) {
        expect(loggerStub.called).to.be.true;
        expect(loggerStub.firstCall.args[0]).to.include(ERROR_WHILE_UPDATING_REQUEST);
        expect(loggerStub.firstCall.args[1]).to.equal(err);
      }
    });
  });
});