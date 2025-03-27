import sinon from "sinon";
import cleanDb from "../../utils/cleanDb";
import {
    OOO_STATUS_ALREADY_EXIST,
    REQUEST_ALREADY_PENDING,
    REQUEST_STATE,
    REQUEST_TYPE,
    USER_STATUS_NOT_FOUND,
} from "../../../constants/requests";
import { createOOORequest, validateUserStatus } from "../../../services/oooRequest";
import { expect } from "chai";
import { testUserStatus, validOooStatusRequests, validUserCurrentStatus } from "../../fixtures/oooRequest/oooRequest";
import { updateUserStatus } from "../../../models/userStatus";
import { userState } from "../../../constants/userStatus";
import addUser from "../../utils/addUser";
import userDataFixture from "../../fixtures/user/user";
const userStatus = require("../../../models/userStatus");
const requestModel = require("../../../models/requests");

describe("Test OOO Request Service", function() {

    let testUserName: string;
    let testUserId: string;

    beforeEach(async function() {
        const user = userDataFixture()[8];
        const userId = await addUser(user);

        testUserId = userId;
        testUserName = user.username;
    });

    afterEach(async function() {
        await cleanDb();
    });

    describe("validateUserStatus", function() {

        it("should return USER_STATUS_NOT_FOUND if user status not found", async function() {
            try {
                await validateUserStatus(testUserId, { ...testUserStatus, userStatusExists: false });
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal(USER_STATUS_NOT_FOUND);
            }
        });

        it("should return OOO_STATUS_ALREADY_EXIST if user status is already OOO", async function() {
            try {
                await validateUserStatus(testUserId, { 
                    ...testUserStatus,
                    data: {
                        ...testUserStatus.data,
                        currentStatus: {
                            ...testUserStatus.data.currentStatus,
                            state: userState.OOO
                        }
                    }
                });
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal(OOO_STATUS_ALREADY_EXIST);
            }
        });

        it("should return undefined when all validation checks passes", async function() {
            const response = await validateUserStatus(testUserId, testUserStatus);
            expect(response).to.not.exist;
        });
    });

    describe("createOOORequest", function() {

        beforeEach(async function() {
            await updateUserStatus(testUserId, testUserStatus.data);
        });

        afterEach(async function () {
            sinon.restore();
        });

        it("should return USER_STATUS_NOT_FOUND if user status not found", async function() {
            const getUserStatusStub = sinon.stub(userStatus, 'getUserStatus').resolves({ userStatusExists: false });
            try {
                await createOOORequest(validOooStatusRequests, testUserName, testUserId);
            } catch (error) {
                expect(getUserStatusStub.calledOnceWith(testUserId)).to.be.true;
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal(USER_STATUS_NOT_FOUND);
            }
        });

        it("should return OOO_STATUS_ALREADY_EXIST if user status is already OOO", async function() {
            const getUserStatusStub = sinon.stub(userStatus, 'getUserStatus').resolves({
                userStatusExists: true,
                data: {
                    currentStatus: validUserCurrentStatus,
                },
            });
            try {
                await createOOORequest(validOooStatusRequests, testUserName, testUserId);
            } catch (error) {
                expect(getUserStatusStub.calledOnceWith(testUserId)).to.be.true;
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal(OOO_STATUS_ALREADY_EXIST);
            }
        });

        it("should return REQUEST_ALREADY_PENDING if user has already pending request", async function() {
            const mockResponse = {
                id: 'qcl0ZLsnngKUNZY9GkCo',
                userId: testUserId,
                type: REQUEST_TYPE.OOO,
                status: REQUEST_STATE.PENDING,
            };

            const getRequestByKeyValuesStub = sinon.stub(requestModel, "getRequestByKeyValues").resolves(mockResponse);

            try {
                await createOOORequest(validOooStatusRequests, testUserName, testUserId);
            } catch (error) {
                expect(getRequestByKeyValuesStub.calledOnce).to.be.true;
                expect(error.statusCode).to.equal(409);
                expect(error.message).to.equal(REQUEST_ALREADY_PENDING);
            }
        });

        it("should create OOO request", async function() {
            const response = await createOOORequest(
                validOooStatusRequests,
                testUserName,
                testUserId
            );
            expect(response).to.deep.include({
                type: validOooStatusRequests.type,
                from: validOooStatusRequests.from,
                until: validOooStatusRequests.until,
                reason: validOooStatusRequests.reason,
                status: "PENDING",
                lastModifiedBy: null,
                requestedBy: testUserName,
                userId: testUserId,
                comment: null
            });
        });
    });
});
