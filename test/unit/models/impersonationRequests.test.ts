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
  let testUserId:string;
  let impersonationRequests=[];
  const userData = userDataFixture();

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
  describe("getImpersonationRequestById", () => {
    it("should return the impersonation request by id", async () => {
      const impersonationRequest = await impersonationModel.createImpersonationRequest(impersonationRequestsBodyData[0]);
      const request = await impersonationModel.getImpersonationRequestById(impersonationRequest.id);
      expect(request).to.not.be.null;
      expect(request.id).to.equal(impersonationRequest.id);
    });

    it("should return null if the request does not exist", async () => {
      const request = await impersonationModel.getImpersonationRequestById("nonexistentId");
      expect(request).to.be.null;
    });
  });

  describe("getImpersonationRequests", () => {
    beforeEach(async () => {
      impersonationRequests = [];
      impersonationRequests = await Promise.all(
        impersonationRequestsBodyData.slice(0, 5).map((data) =>
          impersonationModel.createImpersonationRequest(data)
        )
      );
    });

    afterEach(async () => {
      sinon.restore();
      await cleanDb();
    });

    it("should return a list of impersonation requests", async () => {
      const requests = await impersonationModel.getImpersonationRequests({});
      expect(requests).to.not.be.null;
      expect(requests.allRequests.length).to.be.greaterThan(0);
      expect(requests.allRequests.length).to.be.equal(impersonationRequests.length);
    });

    it("Should return a list of all the requests with specified status - APPROVED", async () => {
      await cleanDb();
      await Promise.all(
        impersonationRequestsBodyData.slice(0, 5).map((data) =>
          impersonationModel.createImpersonationRequest({...data,status:"APPROVED"})
        )
      );
      const query = { status: REQUEST_STATE.APPROVED };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result).to.not.be.null;
      expect(result.allRequests.every(r => r.status === REQUEST_STATE.APPROVED)).to.be.true;
    });

    it("Should return a list of all the requests with specified status - PENDING", async () => {
      const query = { status: REQUEST_STATE.PENDING };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result).to.not.be.null;
      expect(result.allRequests.every(r => r.status === REQUEST_STATE.PENDING)).to.be.true;
    });

    it("Should return a list of all the requests with specified status - REJECTED", async () => {
      await cleanDb();
      await Promise.all(
        impersonationRequestsBodyData.slice(0, 5).map((data) =>
          impersonationModel.createImpersonationRequest({...data,status:"REJECTED"})
        )
      );
      const query = { status: REQUEST_STATE.REJECTED };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result).to.not.be.null;
      expect(result.allRequests.every(r => r.status === REQUEST_STATE.REJECTED)).to.be.true;
    });

    it("should filter requests by createdBy", async () => {
      const query = { createdBy: impersonationRequests[0].createdBy };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result.allRequests.length).to.be.equal(1);
      expect(result.allRequests.every(r => r.createdBy === impersonationRequests[0].createdBy)).to.be.true;
    });

    it("should return requests by size", async () => {
      const query = { size: 2 };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result.allRequests.length).to.be.equal(2);
    });

    it("should filter requests by createdFor", async () => {
      const query = { createdFor: impersonationRequests[0].createdFor };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result.allRequests.length).to.be.equal(1);
      expect(result.allRequests.every(r => r.createdFor === impersonationRequests[0].createdFor)).to.be.true;
    });


    it("Should return null if no data is found", async () => {
      await cleanDb();
      const query = { status: REQUEST_STATE.PENDING };
      const impersonationRequestData = await impersonationModel.getImpersonationRequests(query);
      expect(impersonationRequestData).to.be.equal(null);
    });

    it("should support pagination", async () => {
      const query = { size: 2 };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result.allRequests.length).to.be.at.most(2);
      expect(result.next).to.exist;
      expect(result.prev).to.be.null;
      expect(result.count).to.be.equal(2);
    });


    it("should return the next doc of results using next cursor", async () => {
      const first = await impersonationModel.getImpersonationRequests({ size: 2 });
      expect(first.next).to.exist;
      const next = await impersonationModel.getImpersonationRequests({ size: 2, next: first.next });
      expect(next.allRequests.length).to.be.at.most(2);
      expect(next.next).to.not.equal(null);
      expect(next.prev).to.not.equal(null);
      expect(next.allRequests[0].id).to.not.equal(first.allRequests[0].id);
    });

    it("should return the previous doc of results using prev cursor", async () => {
      const firstPage = await impersonationModel.getImpersonationRequests({ size: 2 });
      const nextPage = await impersonationModel.getImpersonationRequests({ size: 2, next: firstPage.next });
      if (nextPage.prev) {
        const prevPage = await impersonationModel.getImpersonationRequests({ size: 2, prev: nextPage.prev });
        expect(prevPage.allRequests.length).to.be.at.most(2);
        expect(prevPage.allRequests[0].id).to.equal(firstPage.allRequests[0].id);
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