import sinon from "sinon";
import cleanDb from "../../utils/cleanDb";
import { INVALID_REQUEST_TYPE, REQUEST_ALREADY_APPROVED, REQUEST_ALREADY_REJECTED, REQUEST_APPROVED_SUCCESSFULLY, REQUEST_DOES_NOT_EXIST, REQUEST_STATE, REQUEST_TYPE } from "../../../constants/requests";
import { acknowledgeOOORequest, validateOOOAcknowledgeRequest } from "../../../services/oooRequest";
import * as logService from "../../../services/logService";
import firestore from "../../../utils/firestore";
import { convertDaysToMilliseconds } from "../../../utils/time";
import { expect } from "chai";
import { acknowledgeOooRequest } from "../../fixtures/oooRequest/oooRequest";
import addUser from "../../utils/addUser";
import userDataFixture from "../../fixtures/user/user";
const requestModel = firestore.collection("requests");

describe("Test OOO Request Service", function() {

    const errorMessage = "Unexpected error occured";

    afterEach(async function () {
        sinon.restore();
        await cleanDb();
    });

    describe("validateOOOAcknowledgeRequest", function() {

        const testRequestId = "11111";
        let testRequestData;

        beforeEach(async function () {
            testRequestData = {
                requestId: testRequestId,
                requestType: REQUEST_TYPE.OOO,
                requestStatus: REQUEST_STATE.PENDING,
            }
        });

        it("should return INVALID_REQUEST_TYPE if request type is not OOO", async function() {
            testRequestData = {...testRequestData, requestType: "ONBOARDING"};
            try {
                await validateOOOAcknowledgeRequest(
                    testRequestData.requestId,
                    testRequestData.requestType,
                    testRequestData.requestStatus
                );
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal(INVALID_REQUEST_TYPE);
            }
        });

        it("should return REQUEST_ALREADY_APPROVED if request is already approved", async function() {
            testRequestData = {...testRequestData, requestStatus: REQUEST_STATE.APPROVED};
            try {
                await validateOOOAcknowledgeRequest(
                    testRequestData.requestId,
                    testRequestData.requestType,
                    testRequestData.requestStatus
                );
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal(REQUEST_ALREADY_APPROVED);
            }
        });

        it("should return REQUEST_ALREADY_REJECTED if request is already rejected", async function() {
            testRequestData = {...testRequestData, requestStatus: REQUEST_STATE.REJECTED};
            try {
                await validateOOOAcknowledgeRequest(
                    testRequestData.requestId,
                    testRequestData.requestType,
                    testRequestData.requestStatus
                );
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal(REQUEST_ALREADY_REJECTED);
            }
        });

        it("should return undefined when all validation checks passes", async function() {
            const response = await validateOOOAcknowledgeRequest(
                testRequestData.requestId,
                testRequestData.requestType,
                testRequestData.requestStatus,
            );
            expect(response).to.not.exist;
        });

        it("should throw error", async function() {
            sinon.stub(logService, "addLog").throws(new Error(errorMessage));
            const validateSpy = sinon.spy(require("../../../services/oooRequest"), "validateOOOAcknowledgeRequest");

            try {
                await validateOOOAcknowledgeRequest(
                    testRequestData.requestId,
                    testRequestData.requestType,
                    testRequestData.requestStatus
                );
            } catch (error) {
                expect(error.message).to.equal(errorMessage);
                expect(validateSpy.calledOnce).to.be.true;
            }
        });
    });

    describe("acknowledgeOOORequest", function() {

        let validOOORequest;
        let testUserId;
        let testSuperUserId;

        beforeEach(async function () {
            const userData = userDataFixture();
            const userIdPromises = [addUser(userData[16]), addUser(userData[4])];
            const [userId, superUserId] = await Promise.all(userIdPromises);
            testUserId = userId;
            testSuperUserId = superUserId;

            validOOORequest = await requestModel.add({
                from: Date.now(),
                until: Date.now() + convertDaysToMilliseconds(1),
                type: REQUEST_TYPE.OOO,
                reason: "Out of office for personal emergency.",
                status: REQUEST_STATE.PENDING,
                requestedBy: "test-username-1",
                userId: testUserId,
                comment: null,
                lastModifiedBy: null
            });
        });

        it("should return REQUEST_DOES_NOT_EXIST if invalid request id is passed", async function () {
            try {
                await acknowledgeOOORequest(
                    "11111111111111111111",
                    acknowledgeOooRequest,
                    testSuperUserId
                );
            } catch (error) {
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal(REQUEST_DOES_NOT_EXIST);
            }
        });

        it("should acknowledge OOO request", async function() {
            const response = await acknowledgeOOORequest(
                validOOORequest.id,
                acknowledgeOooRequest,
                testSuperUserId
            );
            expect(response.message).to.equal(REQUEST_APPROVED_SUCCESSFULLY);
            expect(response.data.comment).to.equal(acknowledgeOooRequest.comment);
            expect(response.data.status).to.equal(acknowledgeOooRequest.status);
        });

        it("should throw error", async function() {
            sinon.stub(logService, "addLog").throws(new Error(errorMessage));
            const createSpy = sinon.spy(require("../../../services/oooRequest"), "acknowledgeOOORequest");

            try {
                await acknowledgeOOORequest(
                    validOOORequest.id,
                    acknowledgeOooRequest,
                    testSuperUserId
                );
            } catch (error) {
                expect(error.message).to.equal(errorMessage);
                expect(createSpy.calledOnce).to.be.true;
            }
        });
    });
});
