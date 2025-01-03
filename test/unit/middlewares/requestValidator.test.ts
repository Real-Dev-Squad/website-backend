import { updateOnboardingExtensionRequestValidator, updateRequestValidator } from "../../../middlewares/validators/updateRequestValidator";
import sinon from "sinon";
import { expect } from "chai";
import { REQUEST_TYPE } from "../../../constants/requests";
import { convertDaysToMilliseconds } from "../../../utils/time";

describe("updateRequestValidator", () => {
    let req, res, next: sinon.SinonSpy;
    
    beforeEach(() => {
        next = sinon.spy();
        res = { boom: { badRequest: sinon.spy() } }
    });

    afterEach(() => {
        sinon.restore();
    })

    it("should call next for correct type", async () => {
        req = { body: { type: REQUEST_TYPE.ONBOARDING, newEndsOn: Date.now() + convertDaysToMilliseconds(2) } };
        await updateRequestValidator(req, res, next);
        expect(next.calledOnce).to.be.true;
    })

    it("should not call next for incorrect type", async () => {
        req = { body: { type: REQUEST_TYPE.OOO } };
        await updateRequestValidator(req, res, next);
        expect(next.notCalled).to.be.true;
    })
})

describe("updateOnboardingExtensionRequestValidator", () => {
    let req, res, next: sinon.SinonSpy;

    beforeEach(() => {
        next = sinon.spy();
        res = { boom: { badRequest: sinon.spy() } };
    });

    afterEach(() => {
        sinon.restore();
    })

    it("should not call next for incorrect type ", async () => {
        req = {
            body: {
                type: REQUEST_TYPE.OOO,
                newEndsOn: Date.now() + convertDaysToMilliseconds(3)
            }
        }

        await updateOnboardingExtensionRequestValidator(req, res, next);
        expect(next.notCalled).to.be.true;
    });

    it("should not call next for incorrect newEndsOn ", async () => {
        req = {
            body: {
                type: REQUEST_TYPE.ONBOARDING,
                newEndsOn: Date.now() - convertDaysToMilliseconds(1)
            }
        }

        await updateOnboardingExtensionRequestValidator(req, res, next);
        expect(next.notCalled).to.be.true;
    });

    it("should call next for successful validaton", async () => {
        req = {
            body: {
                type: REQUEST_TYPE.ONBOARDING,
                newEndsOn: Date.now() + convertDaysToMilliseconds(3)
            }
        }

        await updateOnboardingExtensionRequestValidator(req, res, next);
        expect(next.calledOnce).to.be.true;
    });
})