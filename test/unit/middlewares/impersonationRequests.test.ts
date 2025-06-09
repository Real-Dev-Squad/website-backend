import chai from "chai";
import sinon from "sinon";
import { createImpersonationRequestValidator } from "../../../middlewares/validators/impersonationRequests";
import { CreateImpersonationRequestBody } from "../../../types/impersonationRequest";
const { expect } = chai;

describe("Impersonation Request Validators", function () {
  let req: any;
  let res: any;
  const requestBody: CreateImpersonationRequestBody = {
    impersonatedUserId: "randomId",
    reason: "Testing purpose"
  };
  let nextSpy: sinon.SinonSpy;

  beforeEach(function () {
    res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    nextSpy = sinon.spy();
  });

  describe("createImpersonationRequestValidator", function () {
    it("should validate for a valid create impersonation request", async function () {
      req = {
        body: requestBody
      };
      await createImpersonationRequestValidator(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should not validate for an invalid impersonation request on missing impersonatedUserId", async function () {
      const req = {
        body: { ...requestBody, impersonatedUserId: "" },
      };
      try {
        await createImpersonationRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error.details[0].message).to.equal("impersonatedUserId cannot be empty");
      }
    });

    it("should not validate for an invalid impersonation request on missing reason", async function () {
      const req = {
        body: { ...requestBody, reason: "" },
      };
      try {
        await createImpersonationRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error.details[0].message).to.equal("reason cannot be empty");
      }
    });
  });
});