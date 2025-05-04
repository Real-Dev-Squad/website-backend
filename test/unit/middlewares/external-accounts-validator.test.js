import { expect } from "chai";
import sinon from "sinon";

import {
  externalAccountData,
  postExternalAccountsUsers,
  linkDiscord,
} from "../../../middlewares/validators/external-accounts.js";
import { EXTERNAL_ACCOUNTS_POST_ACTIONS } from "../../../constants/external-accounts.js";

describe("Middleware | Validators | external accounts", function () {
  describe("externalAccountsData", function () {
    it("allows the request to pass to next function", async function () {
      const req = {
        body: {
          type: "some type",
          token: "some token",
          attributes: {
            userName: "some name",
            discriminator: "some discriminator",
            userAvatar: "some avatar",
            discordId: "some id",
            discordJoinedAt: "some date",
            expiry: Date.now(),
          },
        },
      };
      const res = {};
      const nextSpy = sinon.spy();
      await externalAccountData(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("stops the propogation of request to the next function", async function () {
      const req = {
        body: {},
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await externalAccountData(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });

  describe("postExternalAccountsUsers", function () {
    it("should be successful when valid query params are passed", async function () {
      const req = {
        query: { action: EXTERNAL_ACCOUNTS_POST_ACTIONS.DISCORD_USERS_SYNC },
      };
      const res = {};
      const nextSpy = sinon.spy();
      await postExternalAccountsUsers(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should be respond with bad request when invalid query params are passed", async function () {
      const req = {
        query: { action: "abc" },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextSpy = sinon.spy();
      await postExternalAccountsUsers(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
  });

  describe("linkDiscord", function () {
    it("should call next with a valid token", async function () {
      const req = { params: { token: "validToken" } };
      const res = {};
      const nextSpy = sinon.spy();
      await linkDiscord(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should throw an error when token is empty", async function () {
      const req = { params: { token: "" } };
      const res = { boom: { badRequest: sinon.spy() } };
      const nextSpy = sinon.spy();
      await linkDiscord(req, res, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.be.equal(true);
    });
  });
});
