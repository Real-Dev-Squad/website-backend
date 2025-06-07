import { expect } from "chai";
import cleanDb from "../../utils/cleanDb";
import * as impersonationModel from "../../../models/impersonationRequests";
import {
  impersonationRequestsBodyData,
} from "../../fixtures/impersonation-requests/impersonationRequests";
import { REQUEST_STATE, ERROR_WHILE_CREATING_REQUEST} from "../../../constants/requests";
import addUser from "../../utils/addUser";
import userDataFixture from "./../../fixtures/user/user";
import sinon from "sinon";
import { CreateImpersonationRequestModelDto } from "../../../types/impersonationRequest";
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