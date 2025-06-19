import { expect } from "chai";
import sinon from "sinon";
import * as impersonationService from "../../../services/impersonationRequests";
import * as impersonationModel from "../../../models/impersonationRequests"
import { REQUEST_STATE, TASK_REQUEST_MESSAGES } from "../../../constants/requests";
import userDataFixture from "../../fixtures/user/user";
import addUser from "../../utils/addUser";
import cleanDb from "../../utils/cleanDb";
import { impersonationRequestsBodyData } from "../../fixtures/impersonation-requests/impersonationRequests";
import { CreateImpersonationRequestModelDto } from "../../../types/impersonationRequest";
import { Timestamp } from "firebase-admin/firestore";
const userQuery = require("../../../models/users");


describe("Tests Impersonation Requests Service", () => {
  let testUserId: string;
  let mockRequestBody: CreateImpersonationRequestModelDto;
  let userDetail;
  const userData = userDataFixture();

  beforeEach(async () => {
    await cleanDb();
    testUserId = await addUser(userData[20]);
    userDetail = userData[20];
  });

  afterEach(async () => {
    await cleanDb();
    sinon.restore();
  });


 describe("createImpersonationRequestService", () => {
    beforeEach(async () => {
      mockRequestBody = impersonationRequestsBodyData[0];
    });

    afterEach(async () => {
      await cleanDb();
      sinon.restore();
    });

    it("should return NotFound error with USER_NOT_FOUND if userId does not exist", async () => {
      sinon.stub(userQuery, "fetchUser").returns({userExists:false})
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
        status: REQUEST_STATE.PENDING,
        isImpersonationFinished: false,
        createdBy: mockRequestBody.createdBy,
        createdFor: mockRequestBody.createdFor,
        userId: mockRequestBody.userId,
        reason: "He asked",
        impersonatedUserId: testUserId,
        createdAt:Timestamp.now(),
        updatedAt:Timestamp.now() 
      }));

      const response = await impersonationService.createImpersonationRequestService({
        userId: mockRequestBody.userId,
        createdBy: mockRequestBody.createdBy,
        impersonatedUserId: testUserId,
        reason: mockRequestBody.reason,
      });

      expect(response).to.not.be.null;
      expect(response.createdBy).to.equal(mockRequestBody.createdBy);
      expect(response.id).to.not.be.null;
      expect(response.userId).to.equal(mockRequestBody.userId);
      expect(response.impersonatedUserId).to.equal(testUserId);
    });

    it("should throw error when createImpersonationRequestService fails", async ()=>{
       sinon.stub(userQuery, "fetchUser").throws(new Error("error"));
      try{
      await impersonationService.createImpersonationRequestService({
        userId: mockRequestBody.userId,
        createdBy: mockRequestBody.createdBy,
        impersonatedUserId: testUserId,
        reason: mockRequestBody.reason,
      })
      }catch(error){
      expect(error.message).to.equal("error");
      }
    })
  });
});
