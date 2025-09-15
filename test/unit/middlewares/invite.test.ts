import chai from "chai";
import sinon from "sinon";
const { expect } = chai;

import { createInviteValidator  } from "./../../../middlewares/validators/invites";
import { InviteBodyData, inviteData } from "./../../fixtures/invites/invitesData";

describe("Invite Validators", function () {
  describe("createInviteValidator", function () {
    it("should pass validation for a valid create request", async function () {
      const req = {
        body: InviteBodyData,
      };
      const res = {};
      const nextSpy = sinon.spy();

      await createInviteValidator(req as any, res as any, nextSpy);

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

      await createInviteValidator(req as any, res as any, nextSpy);

      expect(res.boom.badRequest.calledOnce).to.equal(true);
      expect(nextSpy.calledOnce).to.equal(false);
    });
  });
});
