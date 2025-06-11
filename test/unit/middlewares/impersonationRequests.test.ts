import chai from "chai";
import sinon from "sinon";
import { getImpersonationRequestsValidator } from "../../../middlewares/validators/impersonationRequests";
import { CreateImpersonationRequestBody } from "../../../types/impersonationRequest";

const { expect } = chai;

describe("Impersonation Request Validators", function () {
  let req: any;
  let res: any;
  let requestBody: CreateImpersonationRequestBody = {
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

  describe("getImpersonationRequestValidator", function () {
    it("Should pass validation for a valid get request", async function () {
      req = {};
      await getImpersonationRequestsValidator(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("Should throw an error for an invalid get request", async function () {
      req = {
        query: {
          status: "RANDOM"
        },
      };
      await getImpersonationRequestsValidator(req as any, res as any, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });
});