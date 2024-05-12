import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import { createExtensionRequestValidator } from "../../../middlewares/validators/extensionRequestsv2";
import { extensionCreateObject } from "../../fixtures/extension-requests/extensionRequests";
import { REQUEST_STATE } from "../../../constants/requests";
import { ExtensionRequestRequest, ExtensionRequestResponse } from "../../../types/extensionRequests";

describe("Extension Request Validators", function () {
    describe("createExtensionRequestValidator", function () {
        it("should validate for a valid create extension request", async function () {
            const req = {
                body: extensionCreateObject,
            };
            const res = {};
            const nextSpy = sinon.spy();
            const response = await createExtensionRequestValidator(req as ExtensionRequestRequest, res as ExtensionRequestResponse, nextSpy);
            expect(nextSpy.calledOnce);
        });

        it("should not validate for an invalid extension request on wrong type", async function () {
            const req = {
                body: { ...extensionCreateObject, type: "ACTIVE" },
            };
            const res = {};
            const nextSpy = sinon.spy();
            try {
                await createExtensionRequestValidator(req as ExtensionRequestRequest, res as ExtensionRequestResponse, nextSpy);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.details[0].message).to.equal(`"type" must be [EXTENSION]`);
            }
        });

        it("should not validate for an invalid extension request on wrong status", async function () {
            const req = {
                body: { ...extensionCreateObject, state: REQUEST_STATE.APPROVED },
            };
            const res = {};
            const nextSpy = sinon.spy();
            try {
                await createExtensionRequestValidator(req as ExtensionRequestRequest, res as ExtensionRequestResponse, nextSpy);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.details[0].message).to.equal(`"state" must be [PENDING]`);
            }
        });

        it("should not validate for an invalid extension request on missing taskId", async function () {
            const req = {
                body: { ...extensionCreateObject, taskId: "" },
            };
            const res = {};
            const nextSpy = sinon.spy();
            try {
                await createExtensionRequestValidator(req as ExtensionRequestRequest, res as ExtensionRequestResponse, nextSpy);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.details[0].message).to.equal(`taskId cannot be empty`);
            }
        });
    });
});
