import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import { createOooStatusRequestValidator,updateOooStatusRequestValidator } from "./../../../middlewares/validators/oooRequests";
import { validOooStatusRequests,validOooStatusUpdate } from "../../fixtures/oooRequest/oooRequest";

describe("OOO Status Request Validators", function () {
  describe("createOooStatusRequestValidator", function () {
    it("should validate for a valid create request", async function () {
      const req = {
        body: validOooStatusRequests,
      };
      const res = {};
      const nextSpy = sinon.spy();

       await createOooStatusRequestValidator(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce);
    });
  });

  describe("updateOooStatusRequestValidator", function () {
    it("should validate for a valid update ooo request", async function () {
      const req = {
        body: validOooStatusUpdate,
      };
      const res = {};
      const nextSpy = sinon.spy();

       await updateOooStatusRequestValidator(req as any);
      expect(nextSpy.calledOnce);
    });
  });
});
