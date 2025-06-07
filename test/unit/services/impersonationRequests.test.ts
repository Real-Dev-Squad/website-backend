import { expect } from "chai";
import sinon from "sinon";
import * as impersonationModel from "../../../models/impersonationRequests";
const userQuery = require("../../../models/users");
import * as impersonationService from "../../../services/impersonationRequests";
import {
  REQUEST_STATE,
  REQUEST_ALREADY_PENDING,
  IMPERSONATION_NOT_COMPLETED,
  TASK_REQUEST_MESSAGES,
} from "../../../constants/requests";
import userDataFixture from "./../../fixtures/user/user";
const userData = userDataFixture();
import addUser from "../../utils/addUser";
import cleanDb from "../../utils/cleanDb";
import {
  impersonationRequestsBodyData,
} from "../../fixtures/impersonation-requests/impersonationRequests";
import { CreateImpersonationRequestModelDto, ImpersonationRequest } from "../../../types/impersonationRequest";
const logger = require("../../../utils/logger");

describe("Tests Impersonation Requests Service", () => {
  let testUserId: string;
  let testUserId2: string;
  let requestBody: CreateImpersonationRequestModelDto;
  let impersonationRequest: ImpersonationRequest;
  let userDetail;

  beforeEach(async () => {
    await cleanDb();
    const userIdPromises = [addUser(userData[20]), addUser(userData[18])];
    const [userId1, userId2] = await Promise.all(userIdPromises);
    testUserId = userId1;
    testUserId2 = userId2;
    userDetail = userData[20];
  });

  afterEach(async () => {
    await cleanDb();
    sinon.restore();
  });

  describe("validateImpersonationRequestService tests", () => {
    beforeEach(async () => {
      requestBody = impersonationRequestsBodyData[0];
      impersonationRequest = await impersonationModel.createImpersonationRequest({
        ...requestBody,
        impersonatedUserId: testUserId,
        createdFor: userDetail.username,
      });
    });

    afterEach(async () => {
      await cleanDb();
    });

    it("should return Forbidden error with IMPERSONATION_NOT_COMPLETED if a pending request is already present", async () => {
      try {
        await impersonationService.validateImpersonationRequestService(requestBody.userId, requestBody.createdBy);
      } catch (err) {
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(REQUEST_ALREADY_PENDING);
      }
    });

    it("should not throw any error if a pending request is not present", async () => {
      await cleanDb();
      try {
        await impersonationService.validateImpersonationRequestService(requestBody.userId, requestBody.createdBy);
      } catch (err) {
        expect.fail("Expected no error, but got: " + err.message);
      }
    });


    it("should throw Forbidden error with IMPERSONATION_NOT_COMPLETED if an approved request is present but not impersonated", async () => {
      await impersonationModel.createImpersonationRequest({
        ...impersonationRequestsBodyData[1],
        impersonatedUserId: testUserId,
        createdFor: userDetail.username,
        status: REQUEST_STATE.APPROVED,
      });
      try {
        await impersonationService.validateImpersonationRequestService(requestBody.userId, requestBody.createdBy);
      } catch (err) {
        expect(err.name).to.equal("ForbiddenError");
        expect(err.message).to.equal(IMPERSONATION_NOT_COMPLETED);
      }
    });

     it("should not throw Forbidden error if an approved request is present and impersonated:", async () => {
      await impersonationModel.createImpersonationRequest({
        ...requestBody,
        impersonatedUserId: testUserId2,
        createdFor: userDetail.username,
        status: REQUEST_STATE.APPROVED,
        isImpersonationFinished: true,
      });

       try {
        await impersonationService.validateImpersonationRequestService(
        requestBody.userId,
        testUserId2
      );
      } catch (err) {
        expect.fail("Expected no error, but got: " + err.message);
      }
    });

    it("should not throw IMPERSONATION_NOT_COMPLETED if an approved request is not present", async () => {
     try{
        await impersonationService.validateImpersonationRequestService(
        requestBody.userId,
        testUserId
        );
     }catch(err){
       expect(err.message).to.equal(REQUEST_ALREADY_PENDING);
      }
    });

    it("should log and throw an error when validateImpersonationRequestService fails", async () => {
      const error = new Error("Something went wrong");
      const loggerStub = sinon.stub(logger, "error");
      sinon.stub(impersonationModel, "getImpersonationRequestByKeyValues").throws(error);

      try {
        await impersonationService.validateImpersonationRequestService(requestBody.userId, requestBody.createdBy);
      } catch (err) {
        expect(err.message).to.equal("Something went wrong");
        expect(loggerStub.calledOnce).to.be.true;
        expect(loggerStub.firstCall.args[0]).to.equal("Error while validating the request");
        expect(loggerStub.firstCall.args[1]).to.equal(error);
      }
      sinon.restore();
    });
  });

  describe("createImpersonationRequestService", () => {
    beforeEach(async () => {
      requestBody = impersonationRequestsBodyData[0];
    });

    afterEach(async () => {
      await cleanDb();
    });

    it("should return NotFound error with USER_NOT_FOUND if userId does not exist", async () => {
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
      const response = await impersonationService.createImpersonationRequestService({
        userId: requestBody.userId,
        createdBy: requestBody.createdBy,
        impersonatedUserId: testUserId,
        reason: requestBody.reason,
      });

      expect(response).to.not.be.null;
      expect(response.createdBy).to.be.equal(requestBody.createdBy);
      expect(response.id).to.not.be.null;
      expect(response.userId).to.be.equal(requestBody.userId);
      expect(response.impersonatedUserId).to.be.equal(testUserId);
    });

    it("should throw and log error if validateImpersonationRequestService throws", async () => {
      const validationError = new Error("Validation exploded");
      const loggerStub = sinon.stub(logger, "error");
      const validationStub = sinon.stub(impersonationService, "validateImpersonationRequestService").throws(validationError);

      sinon.stub(userQuery, "fetchUser").resolves({
        userExists: true,
        user: userDetail,
      });

      try {
        await impersonationService.createImpersonationRequestService({
          userId: requestBody.userId,
          createdBy: requestBody.createdBy,
          impersonatedUserId: testUserId,
          reason: requestBody.reason,
        });
        expect.fail("Expected error to be thrown");
      } catch (err) {
        expect(err.message).to.equal("Validation exploded");
        expect(loggerStub.calledOnce).to.be.true;
        expect(loggerStub.firstCall.args[0]).to.equal("Error while creating request");
      }

      validationStub.restore();
    });
  });
});
