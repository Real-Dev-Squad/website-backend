import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

const { createInviteValidator } = require("./../../../middlewares/validators/invites");
import { InviteBodyData, inviteData } from "./../../fixtures/invites/invitesData";

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
});
