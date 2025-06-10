import { expect } from "chai";
import sinon from "sinon";
import * as impersonationService from "../../../services/impersonationRequests";
import { TASK_REQUEST_MESSAGES } from "../../../constants/requests";
import userDataFixture from "../../fixtures/user/user";
import addUser from "../../utils/addUser";
import cleanDb from "../../utils/cleanDb";
import { impersonationRequestsBodyData } from "../../fixtures/impersonation-requests/impersonationRequests";
import { CreateImpersonationRequestModelDto } from "../../../types/impersonationRequest";

const userData = userDataFixture();

describe("Tests Impersonation Requests Service", () => {
  let testUserId: string;
  let requestBody: CreateImpersonationRequestModelDto;
  let userDetail: any;

  beforeEach(async () => {
    await cleanDb();
    const userIdPromises = [addUser(userData[20])];
    const [userId1] = await Promise.all(userIdPromises);
    testUserId = userId1;
    userDetail = userData[20];
  });

  afterEach(async () => {
    await cleanDb();
    sinon.restore();
  });

  describe("createImpersonationRequestService", () => {
    beforeEach(async () => {
      requestBody = impersonationRequestsBodyData[0];
    });

    afterEach(async () => {
      await cleanDb();
      sinon.restore();
    });

    it("should return NotFound error with USER_NOT_FOUND if userId does not exist", async () => {
      try {
        await impersonationService.createImpersonationRequestService({
          userId: "randomIs",
          createdBy: "randomName",
          impersonatedUserId: "randomImpersonatedId",
          reason: "He asked",
        });
      } catch (err: any) {
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
  });
});