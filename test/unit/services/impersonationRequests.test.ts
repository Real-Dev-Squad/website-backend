import { expect } from "chai";
import sinon from "sinon";
import * as impersonationService from "../../../services/impersonationRequests";
import * as impersonationModel from "../../../models/impersonationRequests";
import * as logService from "../../../services/logService";
import {TASK_REQUEST_MESSAGES } from "../../../constants/requests";
import userDataFixture from "../../fixtures/user/user";
import cleanDb from "../../utils/cleanDb";
import { impersonationRequestsBodyData } from "../../fixtures/impersonation-requests/impersonationRequests";
import { CreateImpersonationRequestModelDto } from "../../../types/impersonationRequest";
import { Timestamp } from "firebase-admin/firestore";
const userQuery = require("../../../models/users");

describe("Tests Impersonation Requests Service", () => {
  let mockRequestBody: CreateImpersonationRequestModelDto = impersonationRequestsBodyData[0];
  const userData = userDataFixture();

  afterEach(async () => {
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
      
       sinon.stub(userQuery, "fetchUser").returns({ userExists: true, user:userData[20] });

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
});