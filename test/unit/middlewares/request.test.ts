import chai from "chai";
const sinon = require("sinon");
const { expect } = chai;

const {
  createOooStatusRequestValidator,
  updateOooStatusRequestValidator,
  getOooStatusRequestValidator,
} = require("./../../../middlewares/validators/requests");
const { updateOooStatusRequest, createOooStatusRequests } = require("./../../fixtures/oooStatusRequest/oooStatusRequest");

describe("OOO Status Request Validators", function () {
  describe("createOooStatusRequestValidator", function () {
    it("should pass validation for a valid create request", async function () {
      const req = {
        body: createOooStatusRequests,
        userData: {
          id: "user123",
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
        userData: {
          id: "someUserId",
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
        body: updateOooStatusRequest[0],
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
    it("should pass validation for no values for query params are passed", async function () {
      const req = { query: {} };
      const res = {};
      const nextSpy = sinon.spy();

      await getOooStatusRequestValidator(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should pass validation for valid query parameters", async function () {
      const req = {
        query: {
          q: "status:approved",
        },
      };
      const res = {};
      const nextSpy = sinon.spy();

      await getOooStatusRequestValidator(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should not pass validation when next and prev are passed together", async function () {
      const req = {
        query: {
          next: "value",
          prev: "value",
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
    });
  });
});
