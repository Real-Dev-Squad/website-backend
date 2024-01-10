const { expect } = require("chai");
const sinon = require("sinon");
const {
  createOooStatusRequestValidator,
  updateOooStatusRequestValidator,
  getOooStatusRequestValidator,
} = require("./../../../middlewares/validators/requests");
const { REQUEST_STATE } = require("../../../constants/request");

describe("OOO Status Request Validators", function () {
  describe("createOooStatusRequestValidator", function () {
    it("should pass validation for a valid create request", async function () {
      const req = {
        body: {
          userId: "user123",
          from: 1234567890,
          until: 1234567899,
          message: "Out of office for personal reasons.",
          state: REQUEST_STATE.PENDING,
          createdAt: 1234567890,
          updatedAt: 1234567890,
        },
      };
      const res = {};
      const nextSpy = sinon.spy();

      await createOooStatusRequestValidator(req, res, nextSpy);

      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid create request", async function () {
      const req = {
        body: {
          // Missing required fields
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextSpy = sinon.spy();

      await createOooStatusRequestValidator(req, res, nextSpy);

      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });

  describe("updateOooStatusRequestValidator", function () {
    it("should pass validation for a valid update request", async function () {
      const req = {
        body: {
          state: REQUEST_STATE.APPROVED,
          processedBy: "admin123",
          updatedAt: 1234567890,
          reason: "Approval granted.",
        },
      };
      const res = {};
      const nextSpy = sinon.spy();

      await updateOooStatusRequestValidator(req, res, nextSpy);

      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid update request", async function () {
      const req = {
        body: {
          // Missing required fields
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextSpy = sinon.spy();

      await updateOooStatusRequestValidator(req, res, nextSpy);

      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });

  describe("getOooStatusRequestValidator", function () {
    it("should pass validation for a valid get request", async function () {
      const req = {
        query: {
          dev: true,
          cursor: "abc123",
          order: "asc",
          size: 10,
          q: "status:pending",
        },
      };
      const res = {};
      const nextSpy = sinon.spy();

      await getOooStatusRequestValidator(req, res, nextSpy);

      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid get request", async function () {
      const req = {
        query: {
          // Invalid query parameters
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextSpy = sinon.spy();

      await getOooStatusRequestValidator(req, res, nextSpy);

      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });
});
