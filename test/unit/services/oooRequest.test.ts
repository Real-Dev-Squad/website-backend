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
    validateOooAcknowledgeRequest
} from "../../../services/oooRequest";
import { expect } from "chai";
import { testUserStatus, validOooStatusRequests, validUserCurrentStatus, createdOOORequest } from "../../fixtures/oooRequest/oooRequest";
import { updateUserStatus } from "../../../models/userStatus";
import { userState } from "../../../constants/userStatus";
import addUser from "../../utils/addUser";
import userDataFixture from "../../fixtures/user/user";
import * as logService from "../../../services/logService";
import { testAcknowledgeOooRequest, createOooRequests3 } from "../../fixtures/oooRequest/oooRequest";
import { createRequest } from "../../../models/requests";

describe("Test OOO Request Service", function() {

    let testUserName: string;
    let testUserId: string;
    const errorMessage = "Unexpected error occured";

    beforeEach(async function() {
        const users = userDataFixture();
        testUserId = await addUser(users[8]);
        testUserName = users[8].username;
    });

    afterEach(async function() {
        sinon.restore();
        await cleanDb();
    });

    describe("validateUserStatus", function() {

        it("should return USER_STATUS_NOT_FOUND if user status not found", async function() {
            const validationResponse = await validateUserStatus(
                testUserId,
                { ...testUserStatus, userStatusExists: false }
            );
            expect(validationResponse).to.be.not.undefined;
            expect(validationResponse.error).to.equal(USER_STATUS_NOT_FOUND);
        });

        it("should return OOO_STATUS_ALREADY_EXIST if user status is already OOO", async function() {
            const validationResponse = await validateUserStatus(
                testUserId,
                {
                    ...testUserStatus,
                    data: {
                        ...testUserStatus.data,
                        currentStatus: {
                            ...testUserStatus.data.currentStatus,
                            state: userState.OOO
                        }
                    }
                }
            );
            expect(validationResponse).to.be.not.undefined;
            expect(validationResponse.error).to.equal(OOO_STATUS_ALREADY_EXIST);
        });

        it("should return undefined when all validation checks passes", async function() {
            const response = await validateUserStatus(testUserId, testUserStatus);
            expect(response).to.not.exist;
        });
    });

    describe("createOooRequest", function() {

        beforeEach(async function() {
            await updateUserStatus(testUserId, testUserStatus.data);
        });

        afterEach(async function () {
            sinon.restore();
        });

        it("should create OOO request", async function() {
            const response = await createOooRequest(validOooStatusRequests, testUserName, testUserId);
            expect(response).to.deep.include({
                ...createdOOORequest,
                id: response.id,
                requestedBy:testUserName,
                userId: testUserId
            });
        });

        it("should throw error", async function () {
            sinon.stub(logService, "addLog").throws(new Error(errorMessage));

            try {
                await createOooRequest(validOooStatusRequests, testUserName, testUserId);
            } catch (error) {
                expect(error.message).to.equal(errorMessage);
            }
        });
    });

    describe("validateOooAcknowledgeRequest", function() {

        let testOooRequest;

        beforeEach(async function () {
            testOooRequest = await createRequest({
                ...createOooRequests3,
                userId: testUserId,
                comment: null,
                lastModifiedBy: null,
            });
        });

        it("should return INVALID_REQUEST_TYPE if request type is not OOO", async function() {
            const validationResponse = await validateOooAcknowledgeRequest(
                testOooRequest.id,
                REQUEST_TYPE.ONBOARDING,
                testOooRequest.status
            );
            expect(validationResponse.error).to.be.not.undefined;
            expect(validationResponse.error).to.equal(INVALID_REQUEST_TYPE);
        });

        it("should return REQUEST_ALREADY_APPROVED if request is already approved", async function() {
            const validationResponse = await validateOooAcknowledgeRequest(
                testOooRequest.id,
                testOooRequest.type,
                REQUEST_STATE.APPROVED
            );
            expect(validationResponse.error).to.be.not.undefined;
            expect(validationResponse.error).to.equal(REQUEST_ALREADY_APPROVED);
        });

        it("should return REQUEST_ALREADY_REJECTED if request is already rejected", async function() {
            const validationResponse = await validateOooAcknowledgeRequest(
                testOooRequest.id,
                testOooRequest.type,
                REQUEST_STATE.REJECTED
            );
            expect(validationResponse.error).to.be.not.undefined;
            expect(validationResponse.error).to.equal(REQUEST_ALREADY_REJECTED);
        });

        it("should return undefined when all validation checks passes", async function() {
            const response = await validateOooAcknowledgeRequest(
                testOooRequest.id,
                testOooRequest.type,
                testOooRequest.status
            );
            expect(response).to.not.exist;
        });
    });

    describe("acknowledgeOooRequest", function() {

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

        it("should return REQUEST_DOES_NOT_EXIST if invalid request id is passed", async function () {
            const invalidOOORequestId = "11111111111111111111";
            const response = await acknowledgeOooRequest(
                invalidOOORequestId,
                testAcknowledgeOooRequest,
                testSuperUserId
            );
            expect(response.error).to.equal(REQUEST_DOES_NOT_EXIST);
        });

        it("should approve OOO request", async function() {
            const response = await acknowledgeOooRequest(
                testOooRequest.id,
                testAcknowledgeOooRequest,
                testSuperUserId
            );
            expect(response).to.deep.include({
                message: REQUEST_APPROVED_SUCCESSFULLY,
                data: {
                    ...testAcknowledgeOooRequest,
                    id: testOooRequest.id,
                    lastModifiedBy: testSuperUserId,
                    updatedAt: response.data.updatedAt
                }
            });
        });

        it("should reject OOO request", async function() {
            const response = await acknowledgeOooRequest(
                testOooRequest.id,
                { ...testAcknowledgeOooRequest, status: REQUEST_STATE.REJECTED },
                testSuperUserId
            );
            expect(response).to.deep.include({
                message: REQUEST_REJECTED_SUCCESSFULLY,
                data: {
                    ...testAcknowledgeOooRequest,
                    id: testOooRequest.id,
                    status: REQUEST_STATE.REJECTED,
                    lastModifiedBy: testSuperUserId,
                    updatedAt: response.data.updatedAt
                }
            });
        });

        it("should throw error", async function() {
            sinon.stub(logService, "addLog").throws(new Error(errorMessage));
            const createSpy = sinon.spy(require("../../../services/oooRequest"), "acknowledgeOooRequest");

            try {
                await acknowledgeOooRequest(
                    testOooRequest.id,
                    testAcknowledgeOooRequest,
                    testSuperUserId
                );
            } catch (error) {
                expect(error.message).to.equal(errorMessage);
                expect(createSpy.calledOnce).to.be.true;
            }
        });
    });
});