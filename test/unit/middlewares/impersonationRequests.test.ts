import chai from "chai";
import sinon from "sinon";
import { getImpersonationRequestsValidator } from "../../../middlewares/validators/impersonationRequests";

const { expect } = chai;

describe("Impersonation Request Validators", function () {
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

 describe("getImpersonationRequestsValidator", function () {
    it("should validate for a valid get impersonation requests query", async function () {
      req = {
        query: {
          dev: true,
          status: "APPROVED",
        },
      };
      await getImpersonationRequestsValidator(req as GetImpersonationControllerRequest, res as ImpersonationRequestResponse, nextSpy);
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should not validate for an invalid status in query", async function () {
      req = {
        query: {
          dev: true,
          status: "INVALID_STATUS",
        },
      };
      await getImpersonationRequestsValidator(req as GetImpersonationControllerRequest, res as ImpersonationRequestResponse, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.be.true;
      expect(nextSpy.called).to.be.false;
    });
  });
});