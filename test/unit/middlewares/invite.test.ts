import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

const { createInviteValidator, getInviteValidator } = require("./../../../middlewares/validators/invite");
const { InviteBodyData, inviteData } = require("./../../fixtures/invite/inviteData");

describe("Invite Validators", function () {
  describe("createInviteValidator", function () {
    it("should pass validation for a valid create request", async function () {
      const req = {
        body: InviteBodyData,
      };
      const res = {};
      const nextSpy = sinon.spy();

      await createInviteValidator(req, res, nextSpy);

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

      await createInviteValidator(req, res, nextSpy);

      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });

  describe("getInviteValidator", function () {
    it("should pass validation for a valid get request", async function () {
      const req = {
        query: {
          uniqueUserId: "user454fdfff1",
        },
      };
      const res = inviteData[0];
      const nextSpy = sinon.spy();

      await getInviteValidator(req, res, nextSpy);

      expect(nextSpy.calledOnce).to.equal(true);
    });

    it("should throw an error for an invalid get request", async function () {
      const req = {
        query: {
          // Missing required fields
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextSpy = sinon.spy();

      await getInviteValidator(req, res, nextSpy);

      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });
});
