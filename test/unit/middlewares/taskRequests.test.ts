import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import { createTaskRequestValidator } from "./../../../middlewares/validators/taskRequests";

import { validTaskCreqtionRequest, validTaskAssignmentRequest } from "../../fixtures/taskRequests/taskRequests.js";

describe("Task Request Validators", function () {
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
  describe("createTaskRequestValidator", function () {
    it("should validate for a valid create request", async function () {
      req = {
        body: validTaskCreqtionRequest,
      };
      res = {};

      await createTaskRequestValidator(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce);
    });

    it("should not validate for an invalid request on wrong type", async function () {
      req = {
        body: { type: "ACTIVE" },
        res: {},
      };
      try {
        await createTaskRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.details[0].message).to.equal("requestType is required");
      }
    });

    it("should validate for varid task assignment request", async function () {
      req = {
        body: validTaskAssignmentRequest,
      };
      res = {};

      await createTaskRequestValidator(req as any, res as any, nextSpy);
      expect(nextSpy.calledOnce);
    });

    it("should not validate if taskID is missing in task assignment request", async function () {
      req = {
        body: {
          ...validTaskAssignmentRequest,
          taskId: undefined,
        },
      };
      try {
        await createTaskRequestValidator(req as any, res as any, nextSpy);
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.details[0].message).to.equal("taskId is required when requestType is ASSIGNMENT");
      }
    });
  });
});
