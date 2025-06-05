import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import * as impersonationModel from "../../../models/impersonationRequests";
import {
  impersonationRequestsBodyData,
  updateImpersonationRequestApproved,
  updateImpersonationRequestRejected,
} from "../../fixtures/impersonation-requests/impersonationRequests";
import { REQUEST_STATE, ERROR_WHILE_CREATING_REQUEST, ERROR_WHILE_FETCHING_REQUEST, ERROR_WHILE_UPDATING_REQUEST } from "../../../constants/requests";
import { Timestamp } from "firebase-admin/firestore";
import addUser from "../../utils/addUser";
import userDataFixture from "./../../fixtures/user/user";
import sinon from "sinon";
import { CreateImpersonationRequestModelDto, UpdateImpersonationRequestStatusBody } from "../../../types/impersonationRequest";
const firestore = require("../../../utils/firestore");
const logger = require("../../../utils/logger");
const userData = userDataFixture();

let testUserId: string;
let requestBody: CreateImpersonationRequestModelDto;
let impersonationRequests = [];

describe("models/impersonationRequests", () => {
  let impersonationRequest;

  beforeEach(async () => {
    await cleanDb();
    const userIdPromises = [addUser(userData[16])];
    const [userId] = await Promise.all(userIdPromises);
    testUserId = userId;
    requestBody = impersonationRequestsBodyData[0];
  });

  afterEach(async () => {
    sinon.restore();
    await cleanDb();
  });

  describe("createImpersonationRequest", () => {
    it("should create a new impersonation request", async () => {
      impersonationRequest = await impersonationModel.createImpersonationRequest(requestBody);
      expect(impersonationRequest).to.have.property("id");
      expect(impersonationRequest).to.include({
        createdBy: requestBody.createdBy,
        impersonatedUserId: requestBody.impersonatedUserId,
        createdFor: requestBody.createdFor,
        status: REQUEST_STATE.PENDING,
      });
    });

    it("should throw an error if there is an existing impersonation request", async () => {
      try {
        await impersonationModel.createImpersonationRequest(requestBody);
        await impersonationModel.createImpersonationRequest(requestBody);
      } catch (error) {
        expect(error.message).to.include("Error while creating request");
      }
    });

    it("should create multiple requests for different users", async () => {
      const request1 = await impersonationModel.createImpersonationRequest({ ...impersonationRequestsBodyData[0], createdBy: "user1" });
      const request2 = await impersonationModel.createImpersonationRequest({ ...impersonationRequestsBodyData[0], createdBy: "user2" });
      expect(request1).to.have.property("id");
      expect(request1.createdBy).to.equal("user1");
      expect(request1.impersonatedUserId).to.equal(requestBody.impersonatedUserId);
      expect(request2).to.have.property("id");
      expect(request2.createdBy).to.equal("user2");
      expect(request2.impersonatedUserId).to.equal(requestBody.impersonatedUserId);
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
  });

  describe("getImpersonationRequestById", () => {
    it("should return the impersonation request by id", async () => {
      const impersonationRequest = await impersonationModel.createImpersonationRequest(requestBody);
      const request = await impersonationModel.getImpersonationRequestById(impersonationRequest.id);
      expect(request).to.not.be.null;
      expect(request.id).to.equal(impersonationRequest.id);
    });

    it("should return null if the request does not exist", async () => {
      const request = await impersonationModel.getImpersonationRequestById("nonexistentId");
      expect(request).to.be.null;
    });

    it("should log and throw error if Firestore get fails in getImpersonationRequestById", async () => {
      const error = new Error(ERROR_WHILE_FETCHING_REQUEST);
      const loggerStub = sinon.stub(logger, "error");
      const docUpdateStub = sinon.stub().rejects(error);
      const docStub = sinon.stub().returns({ get: docUpdateStub });
      sinon.stub(firestore.collection("impersonationRequests"), "doc").callsFake(docStub);

      try {
        await impersonationModel.getImpersonationRequestById("");
        expect.fail("Should throw error");
      } catch (err) {
        expect(loggerStub.calledWith(ERROR_WHILE_FETCHING_REQUEST, err)).to.be.true;
      }

      sinon.restore();
    });
  });

  describe("updateImpersonationRequest", () => {
    beforeEach(async () => {
      impersonationRequest = await impersonationModel.createImpersonationRequest(impersonationRequestsBodyData[0]);
    });

    afterEach(async () => {
      sinon.restore();
      await cleanDb();
    });

    it("should approve an impersonation request", async () => {
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatingBody: updateImpersonationRequestApproved,
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      }) as UpdateImpersonationRequestStatusBody;
      expect(updatedRequest.status).to.equal(REQUEST_STATE.APPROVED);
    });

    it("should reject an impersonation request", async () => {
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatingBody: updateImpersonationRequestRejected,
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      }) as UpdateImpersonationRequestStatusBody;
      expect(updatedRequest.status).to.equal(REQUEST_STATE.REJECTED);
    });

    it("should change the startedAt,endedAt and isImpersonationFinished fields on update", async () => {
      const updatedBody = {
        isImpersonationFinished: true,
        startedAt: Timestamp.fromDate(new Date(Date.now())),
        endedAt: Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)),
      };
      const updatedRequest = await impersonationModel.updateImpersonationRequest({
        id: impersonationRequest.id,
        updatingBody: updatedBody,
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
        updatingBody: updateImpersonationRequestApproved,
        lastModifiedBy: impersonationRequest.impersonatedUserId,
      });
      const result = await impersonationModel.getImpersonationRequestById(impersonationRequest.id);
      expect(result).to.not.be.null;
      expect(Number(result.updatedAt)).to.be.greaterThan(before);
    });

    it("should log and throw error if Firestore update fails in updateImpersonationRequest", async () => {
      const error = new Error(ERROR_WHILE_UPDATING_REQUEST);
      const loggerStub = sinon.stub(logger, "error");
      const docUpdateStub = sinon.stub().rejects(error);
      const docStub = sinon.stub().returns({ update: docUpdateStub });
      sinon.stub(firestore.collection("impersonationRequests"), "doc").callsFake(docStub);

      try {
        await impersonationModel.updateImpersonationRequest({
          id: "impersonationRequest.id",
          updatingBody: { status: "APPROVED" },
          lastModifiedBy: impersonationRequest.impersonatedUserId,
        });
        expect.fail("Should throw error");
      } catch (err) {
        expect(loggerStub.calledWith(ERROR_WHILE_UPDATING_REQUEST, err)).to.be.true;
      }
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
      await Promise.all(
        impersonationRequests.map((request) =>
          impersonationModel.updateImpersonationRequest({
            id: request.id,
            updatingBody: updateImpersonationRequestApproved,
            lastModifiedBy: request.impersonatedUserId,
          })
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
      await Promise.all(
        impersonationRequests.map((request) =>
          impersonationModel.updateImpersonationRequest({
            id: request.id,
            updatingBody: updateImpersonationRequestRejected,
            lastModifiedBy: request.impersonatedUserId,
          })
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

    it("should filter requests by both page and size", async () => {
      const query = { page: 1, size: 2 };
      const result = await impersonationModel.getImpersonationRequests(query);
      expect(result.allRequests.length).to.be.equal(2);
      expect(result.page).to.be.equal(2);
    });

    it("Should return empty array if no data is found", async () => {
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

    it("Should return a list of all the requests by page ", async () => {
      const query = { page: 1 };
      const impersonationRequestData = await impersonationModel.getImpersonationRequests(query);
      expect(impersonationRequestData.allRequests.length).to.be.equal(5);
      expect(impersonationRequestData.page).to.be.equal(2);
    });

    it("should return the next page of results using next cursor", async () => {
      const firstPage = await impersonationModel.getImpersonationRequests({ size: 2 });
      expect(firstPage.next).to.exist;
      const nextPage = await impersonationModel.getImpersonationRequests({ size: 2, next: firstPage.next });
      expect(nextPage.allRequests.length).to.be.at.most(2);
      expect(nextPage.allRequests[0].id).to.not.equal(firstPage.allRequests[0].id);
    });

    it("should return the previous page of results using prev cursor", async () => {
      const firstPage = await impersonationModel.getImpersonationRequests({ size: 2 });
      const nextPage = await impersonationModel.getImpersonationRequests({ size: 2, next: firstPage.next });
      if (nextPage.prev) {
        const prevPage = await impersonationModel.getImpersonationRequests({ size: 2, prev: nextPage.prev });
        expect(prevPage.allRequests.length).to.be.at.most(2);
        expect(prevPage.allRequests[0].id).to.equal(firstPage.allRequests[0].id);
      }
    });
  });

  describe("getImpersonationRequestByKeyValues", () => {
    it("should return the request with the specified key value", async () => {
      const impersonationRequestObj = { ...impersonationRequestsBodyData[0], createdBy: userData[16].username, userId: testUserId };
      await impersonationModel.createImpersonationRequest(impersonationRequestObj);
      const request = await impersonationModel.getImpersonationRequestByKeyValues({
        createdBy: userData[16].username,
        userId: testUserId,
      });
      expect(request).to.not.be.undefined;
      expect(request.createdBy).to.equal(userData[16].username);
    });

    it("should return null if the request with the specified key value does not exist", async () => {
      const request = await impersonationModel.getImpersonationRequestByKeyValues({
        createdBy: "randomUser",
        impersonatedUserId: "randomImpersonatedUser",
      });
      expect(request).to.be.null;
    });

    it("should return null for empty keyValues", async () => {
      const request = await impersonationModel.getImpersonationRequestByKeyValues({});
      expect(request).to.be.null;
    });
  });
});