import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import {
  createOooStatusRequestValidator,
  // acknowledgeOOORequestsValidator,
} from "./../../../middlewares/validators/oooRequests";
import { acknowledgeOooRequest, validOooStatusRequests, validOooStatusUpdate } from "../../fixtures/oooRequest/oooRequest";
import _ from "lodash";

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

    it("should not validate when reason is empty and type is invalid", async function () {
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
          type: "ABC",
          from: null,
          until: null,
          reason: "",
        },
      };
      try {
        await createOooStatusRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.details.length).to.equal(4);
        expect(error.details[0].message).to.equal(`"from" must be a number`);
        expect(error.details[1].message).to.equal(`"until" must be a number`);
        expect(error.details[2].message).to.equal('reason cannot be empty');
        expect(error.details[3].message).to.equal('"type" must be [OOO]');
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

  describe.skip("acknowledgeOOORequestsValidator", function () {
    it("should not validate for an invalid request for invalid request type", async function () {
      req = {
        body: { ...acknowledgeOooRequest, type: "XYZ"}
      };

      // await acknowledgeOOORequestsValidator(req, res, nextSpy);
      expect(nextSpy.notCalled).to.be.true;
    });

    it("should not validate for an invalid request if status is incorrect", async function () {
      req = {
        body: { ...acknowledgeOooRequest, status: "PENDING"}
      };

      // await acknowledgeOOORequestsValidator(req, res, nextSpy);
      expect(nextSpy.notCalled).to.be.true;
    });

    it("should validate for a valid acknowledge OOO request if comment not provided by superusers", async function() {
      req = {
        body: _.omit(acknowledgeOooRequest, "comment")
      };
      res = {};
      // await acknowledgeOOORequestsValidator(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.true;
    });

    it("should validate for a valid acknowledge OOO request", async function() {
      req = {
        body: acknowledgeOooRequest
      };
      res = {};
      // await acknowledgeOOORequestsValidator(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.true;
    });
  });
});
