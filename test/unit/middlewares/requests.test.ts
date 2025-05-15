import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import {
  createRequestsMiddleware,
  getRequestsMiddleware,
  updateRequestsMiddleware,
  updateRequestValidator,
} from "../../../middlewares/validators/requests";
import {
  validOooStatusRequests,
  invalidOooStatusRequests,
  validOooStatusUpdate,
  invalidOooStatusUpdate,
} from "../../fixtures/oooRequest/oooRequest";
import { OooRequestCreateRequest, OooRequestResponse } from "../../../types/oooRequest";
import { REQUEST_TYPE } from "../../../constants/requests";
import { convertDaysToMilliseconds } from "../../../utils/time";
import { updateOnboardingExtensionRequestValidator } from "../../../middlewares/validators/onboardingExtensionRequest";

describe("Create Request Validators", function () {
  let req: any;
  let res: any;
  let nextSpy;
  beforeEach(function () {
    res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    nextSpy = sinon.spy();
  });
  describe("createRequestsMiddleware", function () {
    it("should pass validation for a valid create request", async function () {
      req = {
        body: validOooStatusRequests,
      };
      res = {};
      await createRequestsMiddleware(req as OooRequestCreateRequest, res as OooRequestResponse, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid create request", async function () {
      req = {
        body: invalidOooStatusRequests,
      };
      res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };

      await createRequestsMiddleware(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });

  describe("Update Request Validator", function () {
    it("Should pass validation for a valid update ooo request", async function () {
      req = {
        body: validOooStatusUpdate,
        query: {
          dev: "true",
        },
      };
      res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      await updateRequestsMiddleware(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("Should throw an error for an invalid update ooo request", async function () {
      req = {
        body: invalidOooStatusUpdate,
        query: {
          dev: "true",
        },
      };
      res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      await updateRequestsMiddleware(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });

  describe("Get Request Validator", function () {
    it("Should pass validation for a valid get request", async function () {
      req = {
        dev: true,
      };
      res = {};
      await getRequestsMiddleware(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("Should throw an error for an invalid get request", async function () {
      req = {
        query: {
          type: "RANDOM",
          state: "RANDOM",
        },
      };
      res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      await getRequestsMiddleware(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });
});

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