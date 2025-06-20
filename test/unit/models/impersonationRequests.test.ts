import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import * as impersonationModel from "../../../models/impersonationRequests";
import { impersonationRequestsBodyData } from "../../fixtures/impersonation-requests/impersonationRequests";
import { REQUEST_STATE, ERROR_WHILE_CREATING_REQUEST, REQUEST_ALREADY_PENDING, IMPERSONATION_NOT_COMPLETED } from "../../../constants/requests";
import addUser from "../../utils/addUser";
import userDataFixture from "../../fixtures/user/user";
import sinon from "sinon";
import { CreateImpersonationRequestModelDto } from "../../../types/impersonationRequest";


describe("models/impersonationRequests", () => {
  let impersonationRequest;
  let mockRequestBody = impersonationRequestsBodyData[0];
  let testUserId:string;
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
        expect(error.message).to.include(REQUEST_ALREADY_PENDING);
      }
    });

    it("should allow different super users to create requests for same user", async () => {
      const request1 = await impersonationModel.createImpersonationRequest({ ...impersonationRequestsBodyData[0],createdBy: "user1" });
      const request2 = await impersonationModel.createImpersonationRequest({ ...impersonationRequestsBodyData[0],createdBy: "user2", userId:"122" });
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

    it("should throw forbidden error if an APPROVED request with isImpersonationFinished as false is present", async ()=>{
      try {
        await impersonationModel.createImpersonationRequest({...impersonationRequestsBodyData[0],status:REQUEST_STATE.APPROVED});
        await impersonationModel.createImpersonationRequest(impersonationRequestsBodyData[0]);
      } catch (error) {
        expect(error.message).to.include(IMPERSONATION_NOT_COMPLETED);
      }
    })
  });
});