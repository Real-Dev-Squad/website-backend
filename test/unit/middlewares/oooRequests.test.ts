import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import {
  createOooStatusRequestValidator,
} from "./../../../middlewares/validators/oooRequests";
import { validOooStatusRequests } from "../../fixtures/oooRequest/oooRequest";

describe("OOO Status Request Validators", function () {
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
  describe("createOooStatusRequestValidator", function () {
    it("should validate for a valid create request", async function () {
      req = {
        body: validOooStatusRequests,
      };
      res = {};

      await createOooStatusRequestValidator(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce);
    });

    it("should not validate for an invalid request on wrong type", async function () {
      req = {
        body: { ...validOooStatusRequests, type: "ACTIVE" },
      };
      try {
        await createOooStatusRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.details[0].message).to.equal(`"type" must be [OOO]`);
      }
    });

    it.skip("should not validate for an invalid request on empty reason", async function () {
      req = {
        body: { ...validOooStatusRequests, reason: "", type: "ACTIVE" },
      };
      try {
        await createOooStatusRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.details[0].message).to.equal(`reason cannot be empty`);
        expect(error.details[1].message).to.equal(`"type" must be [OOO]`);
      }
    });

    it("should not validate for an invalid request if all invalid values", async function () {
      req = {
        body: {
          type: "OOO",
          from: null,
          until: null,
          message: "",
          state: "APPROVED",
          // reason: "",
        },
      };
      try {
        await createOooStatusRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.details.length).to.equal(4);
        // expect(error.details.length).to.equal(3);
        expect(error.details[0].message).to.equal(`"from" must be a number`);
        expect(error.details[1].message).to.equal(`"until" must be a number`);
        expect(error.details[2].message).to.equal("message cannot be empty");
      }
    });

    it("should not validate for an invalid request if all until date is greater than from", async function () {
      req = {
        body: { ...validOooStatusRequests, from: Date.now() + 5000000, until: Date.now() + 1000000 },
      };
      try {
        await createOooStatusRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.details[0].message).to.equal("until date must be greater than or equal to from date");
      }
    });
  });
});