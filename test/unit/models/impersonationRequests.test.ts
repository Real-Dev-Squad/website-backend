import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import * as impersonationModel from "../../../models/impersonationRequests";
import {
  impersonationRequestsBodyData,
  updateImpersonationRequestApproved,
  updateImpersonationRequestRejected,
} from "../../fixtures/impersonation-requests/impersonationRequests";
import { REQUEST_STATE } from "../../../constants/requests";
import addUser from "../../utils/addUser";
import userDataFixture from "./../../fixtures/user/user";
import sinon from "sinon";
import { CreateImpersonationRequestModelDto } from "../../../types/impersonationRequest";



describe("models/impersonationRequests", () => {
  let impersonationRequest;
  const userData = userDataFixture();
  let testUserId: string;
  let requestBody: CreateImpersonationRequestModelDto;
  let impersonationRequests = [];

  beforeEach(async () => {
    await cleanDb();
    testUserId = await addUser(userData[16]);
    requestBody = impersonationRequestsBodyData[0];
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
});