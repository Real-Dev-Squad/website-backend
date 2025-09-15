import { REQUEST_TYPE } from "../../../constants/requests.js";
import { createOnboardingExtensionRequestValidator } from "../../../middlewares/validators/onboardingExtensionRequest.js";
import sinon from "sinon";
import { CreateOnboardingExtensionBody } from "../../../types/onboardingExtension.js";
import { expect } from "chai";

describe("Onboarding Extension Request Validators", () => {
    let req: any;
    let res: any;
    let nextSpy: sinon.SinonSpy;
    beforeEach(function () {
        res = {
            boom: {
                badRequest: sinon.spy(),
            },
        };
        nextSpy = sinon.spy();
    });
    
    describe("createOnboardingExtensionRequestValidator", () => {
        const requestBody:CreateOnboardingExtensionBody = {
            numberOfDays: 1,
            reason: "This is reason",
            userId: "22222",
            type: REQUEST_TYPE.ONBOARDING
        }
        it("should validate for a valid create request", async () => {
            req = {
                body: requestBody
            };
            res = {};

            await createOnboardingExtensionRequestValidator(req as any, res as any, nextSpy);
            expect(nextSpy.calledOnce, "next should be called once");
        });
        
        it("should not validate for an invalid request on wrong type", async () => {
            req = {
                body: { ...requestBody, type: REQUEST_TYPE.EXTENSION },
            };
            try {
                await createOnboardingExtensionRequestValidator(req as any, res as any, nextSpy);
            } catch (error) {
                expect(error.details[0].message).to.equal(`"type" must be [ONBOARDING]`);
            }
        });

        it("should not validate for an invalid request on wrong numberOfDays", async () => {
            req = {
                body: { ...requestBody, numberOfDays: "2" },
            };
            try {
                await createOnboardingExtensionRequestValidator(req as any, res as any, nextSpy);
            } catch (error) {
                expect(error.details[0].message).to.equal(`numberOfDays must be a number`);
            }
        });

        it("should not validate for an invalid request on wrong userId", async () => {
            req = {
                body: { ...requestBody, userId: undefined },
            };
            try {
                await createOnboardingExtensionRequestValidator(req as any, res as any, nextSpy);
            } catch (error) {
                expect(error.details[0].message).to.equal(`userId is required`);
            }
        });
    });
});