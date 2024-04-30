import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import { createExtensionRequestValidator } from "../../../middlewares/validators/extensionRequestsv2";
import { extensionCreateObject } from "../../fixtures/extension-requests/extensionRequests";
import { REQUEST_STATE } from "../../../constants/requests";

describe("Extension Request Validators", function () {
    let req: any;
    let res: any;
    let nextSpy: any;

    beforeEach(function () {
        res = {
            boom: {
                badRequest: sinon.spy(),
            },
        };
        nextSpy = sinon.spy();
    });

    describe("createExtensionRequestValidator", function () {
        it("should validate for a valid create extension request", async function () {
            req = {
                body: extensionCreateObject,
            };
            res = {};
            console.log("req", req);
            const response = await createExtensionRequestValidator(req as any, res as any, nextSpy);
            console.log("response", response);
            expect(nextSpy.calledOnce);
        });

        it("should not validate for an invalid extension request on wrong type", async function () {
            req = {
                body: { ...extensionCreateObject, type: "ACTIVE" },
            };
            try {
                await createExtensionRequestValidator(req as any, res as any, nextSpy);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.details[0].message).to.equal(`"type" must be [EXTENSION]`);
            }
        });

        it("should not validate for an invalid extension request on wrong status", async function () {
            req = {
                body: { ...extensionCreateObject, state: REQUEST_STATE.APPROVED },
            };
            try {
                await createExtensionRequestValidator(req as any, res as any, nextSpy);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.details[0].message).to.equal(`"state" must be [PENDING]`);
            }
        });

        it("should not validate for an invalid extension request on missing taskId", async function () {
            req = {
                body: { ...extensionCreateObject, taskId: "" },
            };
            try {
                await createExtensionRequestValidator(req as any, res as any, nextSpy);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.details[0].message).to.equal(`"taskId cannot be empty`);
            }
        });
    });
});
