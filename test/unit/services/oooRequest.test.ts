import sinon from "sinon";
import cleanDb from "../../utils/cleanDb";
import {
  INVALID_REQUEST_TYPE,
  REQUEST_ALREADY_APPROVED,
  REQUEST_ALREADY_REJECTED,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_STATE,
  REQUEST_TYPE,
  OOO_STATUS_ALREADY_EXIST,
  USER_STATUS_NOT_FOUND,
} from "../../../constants/requests";
import {
  createOooRequest,
  validateUserStatus,
  acknowledgeOooRequest,
  validateOooAcknowledgeRequest,
} from "../../../services/oooRequest";
import { expect } from "chai";
import {
  testUserStatus,
  validOooStatusRequests,
  validUserCurrentStatus,
  createdOOORequest,
} from "../../fixtures/oooRequest/oooRequest";
import { updateUserStatus } from "../../../models/userStatus";
import { userState } from "../../../constants/userStatus";
import addUser from "../../utils/addUser";
import userDataFixture from "../../fixtures/user/user";
import * as logService from "../../../services/logService";
import { createOooRequests3, testAcknowledgeOooRequest } from "../../fixtures/oooRequest/oooRequest";
import { createRequest } from "../../../models/requests";

describe("Test OOO Request Service", function () {
  let testUserName: string;
  let testUserId: string;
  const errorMessage = "Unexpected error occured";



  beforeEach(async function () {
    const users = userDataFixture();
    testUserId = await addUser(users[8]);
    testUserName = users[8].username;
  });

  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  describe("validateUserStatus", function () {
    it("should return USER_STATUS_NOT_FOUND if user status not found", async function () {
      const validationResponse = await validateUserStatus(testUserId, { ...testUserStatus, userStatusExists: false });
      expect(validationResponse).to.be.not.undefined;
      expect(validationResponse.error).to.equal(USER_STATUS_NOT_FOUND);
    });

    it("should return OOO_STATUS_ALREADY_EXIST if user status is already OOO", async function () {
      const validationResponse = await validateUserStatus(testUserId, {
        ...testUserStatus,
        data: {
          ...testUserStatus.data,
          currentStatus: {
            ...testUserStatus.data.currentStatus,
            state: userState.OOO,
          },
        },
      });
      expect(validationResponse).to.be.not.undefined;
      expect(validationResponse.error).to.equal(OOO_STATUS_ALREADY_EXIST);
    });

    it("should return undefined when all validation checks passes", async function () {
      const response = await validateUserStatus(testUserId, testUserStatus);
      expect(response).to.not.exist;
    });
  });

  describe("createOooRequest", function () {
    beforeEach(async function () {
      await updateUserStatus(testUserId, testUserStatus.data);
    });

    afterEach(async function () {
      sinon.restore();
    });

    it("should create OOO request", async function () {
      const response = await createOooRequest(validOooStatusRequests, testUserId);
      expect(response).to.deep.include({
        ...createdOOORequest,
        id: response.id,
        requestedBy: testUserId,
      });
    });

         it("should throw error", async function () {
       sinon.stub(logService, "addLog").throws(new Error(errorMessage));

       try {
         await createOooRequest(validOooStatusRequests, testUserId);
         expect.fail("Should have thrown an error");
       } catch (error) {
         expect(error.message).to.equal(errorMessage);
       }
     });
  });

  describe("validateOOOAcknowledgeRequest", function () {
    let testOooRequest;

    beforeEach(async function () {
      testOooRequest = await createRequest({
        ...createOooRequests3,
        userId: testUserId,
        comment: null,
        lastModifiedBy: null,
      });
    });

    it("should return INVALID_REQUEST_TYPE if request type is not OOO", async function () {
      try {
        await validateOooAcknowledgeRequest(REQUEST_TYPE.ONBOARDING, testOooRequest.status);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.equal(INVALID_REQUEST_TYPE);
      }
    });

    it("should return REQUEST_ALREADY_APPROVED if request is already approved", async function () {
      try {
        await validateOooAcknowledgeRequest(REQUEST_TYPE.OOO, REQUEST_STATE.APPROVED);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.equal(REQUEST_ALREADY_APPROVED);
      }
    });

    it("should return REQUEST_ALREADY_REJECTED if request is already rejected", async function () {
      try {
        await validateOooAcknowledgeRequest(REQUEST_TYPE.OOO, REQUEST_STATE.REJECTED);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.equal(REQUEST_ALREADY_REJECTED);
      }
    });

    it("should return undefined when all validation checks passes", async function () {
      const response = await validateOooAcknowledgeRequest(REQUEST_TYPE.OOO, REQUEST_STATE.PENDING);
      expect(response).to.not.exist;
    });
  });

  describe("acknowledgeOOORequest", function () {
    let testSuperUserId;
    let testOooRequest;

    beforeEach(async function () {
      const users = userDataFixture();
      const superUserId = await addUser(users[4]);
      testSuperUserId = superUserId;

      testOooRequest = await createRequest({
        ...createOooRequests3,
        userId: testUserId,
        comment: null,
        lastModifiedBy: null,
      });
    });

    it("should return 'Request not found' if invalid request id is passed", async function () {
      const invalidOOORequestId = "11111111111111111111";
      try {
        await acknowledgeOooRequest(invalidOOORequestId, testAcknowledgeOooRequest, testSuperUserId);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.equal("Request not found");
      }
    });

    it("should approve OOO request", async function () {
      const response = await acknowledgeOooRequest(testOooRequest.id, testAcknowledgeOooRequest, testSuperUserId);
      expect(response).to.include({
        message: REQUEST_APPROVED_SUCCESSFULLY,
      });
    });

    it("should reject OOO request", async function () {
      const response = await acknowledgeOooRequest(
        testOooRequest.id,
        { ...testAcknowledgeOooRequest, status: REQUEST_STATE.REJECTED },
        testSuperUserId
      );
      expect(response).to.include({
        message: REQUEST_REJECTED_SUCCESSFULLY,
      });
    });

    it("should propagate error when logging fails", async function () {
      sinon.stub(logService, "addLog").throws(new Error(errorMessage));

      try {
        await acknowledgeOooRequest(testOooRequest.id, testAcknowledgeOooRequest, testSuperUserId);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.equal(errorMessage);
      }
    });
  });
});
