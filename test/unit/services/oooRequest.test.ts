import sinon from "sinon";
import cleanDb from "../../utils/cleanDb";
import {
    OOO_STATUS_ALREADY_EXIST,
    USER_STATUS_NOT_FOUND,
} from "../../../constants/requests";
import { createOooRequest, validateUserStatus } from "../../../services/oooRequest";
import { expect } from "chai";
import { testUserStatus, validOooStatusRequests, validUserCurrentStatus, createdOOORequest } from "../../fixtures/oooRequest/oooRequest";
import { updateUserStatus } from "../../../models/userStatus";
import { userState } from "../../../constants/userStatus";
import addUser from "../../utils/addUser";
import userDataFixture from "../../fixtures/user/user";
import * as logService from "../../../services/logService";

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
});
