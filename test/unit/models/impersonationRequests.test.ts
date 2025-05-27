import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import {
  createImpersonationRequest,
  updateImpersonationRequest,
  getImpersonationRequestById,
  getImpersonationRequests,
  getImpersonationRequestByKeyValues,
} from "../../../models/impersonationRequests";
import {
  ImpersonationRequest2,
  ImpersonationRequest1,
  updateImpersonationRequestApproved,
  updateImpersonationRequestRejected,
  wrongCreateImpersonationRequestModelBody,
  impersonationRequests,
} from "../../fixtures/impersonation-requests/impersonationRequests";
import { REQUEST_STATE, REQUEST_DOES_NOT_EXIST } from "../../../constants/requests";
import addUser from "../../utils/addUser";
import userDataFixture from "./../../fixtures/user/user";
const userData = userDataFixture();

let testUserId: string;
describe.skip("models/impersonationRequests", () => {
  let impersonationRequest;
  beforeEach(async () => {
    await cleanDb();
    const userIdPromises = [addUser(userData[16])];
    const [userId] = await Promise.all(userIdPromises);
    testUserId = userId;
  });

  afterEach(async () => {
    await cleanDb();
  });

  describe("createImpersonationRequest", () => {
    it("should create a new impersonation request", async () => {
      impersonationRequest = await createImpersonationRequest(ImpersonationRequest1);
      expect(impersonationRequest).to.have.property("id");
      expect(impersonationRequest).to.include({
        createdBy: ImpersonationRequest1.createdBy,
        impersonatedUserId: ImpersonationRequest1.impersonatedUserId,
        createdFor: ImpersonationRequest1.createdFor,
        status: REQUEST_STATE.PENDING,
      });
    });
    it("should throw an error if there is an existing impersonation request", async () => {
      try {
        await createImpersonationRequest(ImpersonationRequest1);
        await createImpersonationRequest(ImpersonationRequest1);
        expect.fail("Error while creating request");
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it("should create multiple requests for different users", async () => {
      const req2 = await createImpersonationRequest(ImpersonationRequest2);
      expect(req2).to.have.property("id");
      expect(req2.createdBy).to.equal(ImpersonationRequest2.createdBy);
      expect(req2.impersonatedUserId).to.equal(ImpersonationRequest2.impersonatedUserId);
    });

    it("should fail if required fields are missing", async () => {
      try {
        await createImpersonationRequest({
          ...wrongCreateImpersonationRequestModelBody,
        });
        expect.fail("Should throw error for missing fields");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("getImpersonationRequestById", () => {
    it("should return the impersonation request by id", async () => {
      const impersonationRequest = await createImpersonationRequest(ImpersonationRequest1);
      const request = await getImpersonationRequestById({ id: impersonationRequest.id });
      expect(request).to.not.be.null;
      expect(request.id).to.equal(impersonationRequest.id);
    });

    it("should return null if the request does not exist", async () => {
      const request = await getImpersonationRequestById({ id: "nonexistentId" });
      expect(request).to.be.null;
    });
  });

  describe("updateImpersonationRequest", () => {
    beforeEach(async () => {
      impersonationRequest = await createImpersonationRequest(ImpersonationRequest1);
    });

    it("should approve an impersonation request", async () => {
      const updatedRequest = await updateImpersonationRequest(
        impersonationRequest.id,
        updateImpersonationRequestApproved,
        impersonationRequest.impersonatedUserId
      );
      expect(updatedRequest.status).to.equal(REQUEST_STATE.APPROVED);
    });

    it("should reject an impersonation request", async () => {
      const updatedRequest = await updateImpersonationRequest(
        impersonationRequest.id,
        updateImpersonationRequestRejected,
        impersonationRequest.impersonatedUserId
      );
      expect(updatedRequest.status).to.equal(REQUEST_STATE.REJECTED);
    });


    it("should return error if request does not exist", async () => {
      const result = await updateImpersonationRequest(
        "randomId",
        updateImpersonationRequestApproved,
        impersonationRequest.impersonatedUserId
      );
      expect(result.error).to.equal(REQUEST_DOES_NOT_EXIST);
    });

    it("should change the startedAt,endedAt and isImpersonationAttempted fields on update", async () => {
      const updatedBody={
        isImpersonationAttempted: true,
        startedAt: Date.now(),
        endedAt: Date.now() + 1000,
      }
      const result = await updateImpersonationRequest(
        impersonationRequest.id,
        updatedBody,
        impersonationRequest.userId
      );
      expect(result.isImpersonationAttempted).to.be.true;
      expect(result.startedAt).to.be.greaterThan(0);
      expect(result.endedAt).to.be.greaterThan(result.startedAt);
    });

    it("should change updatedAt timestamp on update", async () => {
      const before = impersonationRequest.updatedAt;
      const updated = await updateImpersonationRequest(
        impersonationRequest.id,
        updateImpersonationRequestApproved,
        impersonationRequest.impersonatedUserId
      );
      expect(updated.updatedAt).to.be.greaterThan(before);
    });
  });

  describe("getImpersonationRequests", () => {
    it("should return a list of impersonation requests", async () => {
      await createImpersonationRequest(ImpersonationRequest1);
      await createImpersonationRequest(ImpersonationRequest2);
      const requests = await getImpersonationRequests({});
      expect(requests).to.not.be.null;
      expect(requests.allRequests.length).to.be.greaterThan(0);
    });

     it("Should return a list of all the requests with specified status - APPROVED", async () => {
         const impersonationRequest = await createImpersonationRequest(ImpersonationRequest1);
         await updateImpersonationRequest(impersonationRequest.id, updateImpersonationRequestApproved, impersonationRequest.impersonatedUserId);
         const query = {status: REQUEST_STATE.APPROVED };
         const impersonationRequestData = await getImpersonationRequests(query);
         expect(impersonationRequestData.allRequests[0].status).to.be.equal(REQUEST_STATE.APPROVED);
       });

    it("Should return a list of all the requests with specified status - PENDING", async () => {
          await createImpersonationRequest(ImpersonationRequest1);
          const query = {status: REQUEST_STATE.PENDING };
          const impersonationRequestData = await getImpersonationRequests(query);
          expect(impersonationRequestData.allRequests[0].status).to.be.equal(REQUEST_STATE.PENDING);
      });

    it("should filter requests by createdBy", async () => {
      await createImpersonationRequest(ImpersonationRequest1);
      const query = {createdBy: ImpersonationRequest1.createdBy };
      const result = await getImpersonationRequests(query);
      expect(result.allRequests.every(r => r.createdBy === ImpersonationRequest1.createdBy)).to.be.true;
    });
    
     it("should filter requests by size", async () => {
      await createImpersonationRequest(ImpersonationRequest1);
      await createImpersonationRequest(ImpersonationRequest2);
      const query = { size: 1 };
      const result = await getImpersonationRequests(query);
      expect(result.allRequests.length).to.be.equal(1);
    });

    it("should filter requests by createdFor", async () => {
      await createImpersonationRequest(ImpersonationRequest1);
      const query = {createdFor: ImpersonationRequest1.createdFor};
      const result = await getImpersonationRequests(query);
      expect(result.allRequests.every(r => r.createdFor === ImpersonationRequest1.createdFor)).to.be.true;
    });

      it("Should return empty array if no data is found", async () => {
          const query = {status: REQUEST_STATE.PENDING };
          const impersonationRequestData = await getImpersonationRequests(query);
          expect(impersonationRequestData).to.be.equal(null);
      });

    it("should support pagination", async () => {
      for (let i = 0; i < 5; i++) {
        await createImpersonationRequest(impersonationRequests[i]);
      }
      const query = {size: 2};
      const result = await getImpersonationRequests(query);
      expect(result.allRequests.length).to.be.at.most(2);
      expect(result.next).to.exist;
      expect(result.prev).to.be.null;
      expect(result.count).to.be.equal(2);
    });

     it("Should return a list of all the requests by page ", async () => {
          await createImpersonationRequest(ImpersonationRequest1);
          await createImpersonationRequest(ImpersonationRequest2);
          const query = { page: 1 };
          const impersonationRequestData = await getImpersonationRequests(query);
          expect(impersonationRequestData.page).to.be.equal(2);
        });
    
      it("Should return a list of all the requests by size ", async () => {
          await createImpersonationRequest(ImpersonationRequest1);
          await createImpersonationRequest(ImpersonationRequest2);
          const query = { size: 1 };
          const impersonationRequestData = await getImpersonationRequests(query);
          expect(impersonationRequestData.allRequests).to.have.lengthOf(1);
      });

    it("should return the next page of results using next cursor", async () => {
      for (let i = 0; i < 5; i++) {
        await createImpersonationRequest(impersonationRequests[i]);
      }
      const firstPage = await getImpersonationRequests({ size: 2 });
      expect(firstPage.next).to.exist;
      const nextPage = await getImpersonationRequests({ size: 2, next: firstPage.next });
      expect(nextPage.allRequests.length).to.be.at.most(2);
      expect(nextPage.allRequests[0].id).to.not.equal(firstPage.allRequests[0].id);
    });

    it("should return the previous page of results using prev cursor", async () => {
      for (let i = 0; i < 5; i++) {
        await createImpersonationRequest(impersonationRequests[i]);
      }
      const firstPage = await getImpersonationRequests({ size: 2 });
      const nextPage = await getImpersonationRequests({ size: 2, next: firstPage.next });
      if (nextPage.prev) {
        const prevPage = await getImpersonationRequests({ size: 2, prev: nextPage.prev });
        expect(prevPage.allRequests.length).to.be.at.most(2);
        expect(prevPage.allRequests[0].id).to.equal(firstPage.allRequests[0].id);
      }
    });
  });

  describe("getImpersonationRequestByKeyValues", () => {
    it("should return the request with the specified key value", async () => {
      const impersonationRequestObj= {...ImpersonationRequest1, createdBy: userData[16].username,userId: testUserId};
      const impersonationRequest = await createImpersonationRequest(impersonationRequestObj);
      const request = await getImpersonationRequestByKeyValues({
        createdBy: userData[16].username,
        userId: testUserId,
      });
      expect(request).to.not.be.undefined;
      expect(request.createdBy).to.equal(userData[16].username);
    });

    it("should return null if the request with the specified key value does not exist", async () => {
      const request = await getImpersonationRequestByKeyValues({
        createdBy: "randomUser",
        impersonatedUserId: "randomImpersonatedUser",
      });
      expect(request).to.be.null;
    });

    it("should return null for empty keyValues", async () => {
      const request = await getImpersonationRequestByKeyValues({});
      expect(request).to.be.null;
    });
  });
});