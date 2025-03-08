import sinon from "sinon";
import cleanDb from "../../utils/cleanDb";
import {
    OOO_STATUS_ALREADY_EXIST,
    REQUEST_ALREADY_PENDING,
    USER_STATUS_NOT_FOUND,
} from "../../../constants/requests";
import { convertDaysToMilliseconds } from "../../../utils/time";
import { createOOORequest, validateUserStatus } from "../../../services/oooRequest";
import { expect } from "chai";
import * as logService from "../../../services/logService";
import { validOooStatusRequests } from "../../fixtures/oooRequest/oooRequest";
import { updateUserStatus } from "../../../models/userStatus";

describe("Test OOO Request Service", function() {
    let testUserStatus;
    const testUserId = "11111";
    const errorMessage = "Unexpected error occured";

    beforeEach(async function() {
        testUserStatus = {
            userId: testUserId,
            currentStatus: {
                updatedAt: Date.now(),
                from: Date.now(),
                until: "",
                message: "",
                state: "ACTIVE",
            }
        };
    });

    afterEach(async function() {
        await cleanDb();
        sinon.restore();
    });

    describe("validateUserStatus", function() {

        it("should return USER_STATUS_NOT_FOUND if user status not found", async function() {
            try {
                await validateUserStatus(
                    testUserId,
                    false,
                    null
                );
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal(USER_STATUS_NOT_FOUND);
            }
        });

        it("should return OOO_STATUS_ALREADY_EXIST if user status is already OOO", async function() {
            testUserStatus = {
                userId: testUserId,
                currentStatus: {
                    updatedAt: Date.now() - convertDaysToMilliseconds(5),
                    from: Date.now(),
                    until: Date.now() + convertDaysToMilliseconds(5),
                    message: "taking OOO for personal reason",
                    state: "OOO",
                }
            };
            try {
                await validateUserStatus(
                    testUserId,
                    true,
                    testUserStatus
                );
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal(OOO_STATUS_ALREADY_EXIST);
            }
        });

        it("should return undefined when all validation checks passes", async function() {
            const response = await validateUserStatus(
                testUserId,
                true,
                testUserStatus
            );
            expect(response).to.not.exist;
        });

        it("should throw error", async function() {
            sinon.stub(logService, "addLog").throws(new Error(errorMessage));
            const validateSpy = sinon.spy(require("../../../services/oooRequest"), "validateUserStatus");

            try {
                await validateUserStatus(
                    testUserId,
                    true,
                    testUserStatus
                );
            } catch(error) {
                expect(error.message).to.equal(errorMessage);
                expect(validateSpy.calledOnce).to.be.true;
            }
        });
    });

    describe("createOOORequest", function() {

        beforeEach(async function() {
            await updateUserStatus(testUserId, testUserStatus);
        });

        it("should return REQUEST_ALREADY_PENDING if user has already pending request", async function() {

            try {
                await createOOORequest(
                    validOooStatusRequests,
                    "test-username-1",
                    testUserId
                );
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(409);
                expect(error.message).to.equal(REQUEST_ALREADY_PENDING);
            }
        });

        it("should create OOO request", async function() {
            const response = await createOOORequest(
                validOooStatusRequests,
                "test-username-1",
                testUserId
            );
            expect(response).to.exist;
            expect(response).to.deep.include({
                type: validOooStatusRequests.type,
                from: validOooStatusRequests.from,
                until: validOooStatusRequests.until,
                reason: validOooStatusRequests.reason,
                status: "PENDING",
                lastModifiedBy: null,
                requestedBy: "test-username-1",
                userId: testUserId,
                comment: null
            });
        });
    });
});
