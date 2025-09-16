import { expect } from "chai";
import sinon from "sinon";

import {
  validateGroupRoleBody,
  validateMemberRoleBody,
  validateUpdateUsersNicknameStatusBody,
  validateLazyLoadingParams,
} from "../../../middlewares/validators/discordactions.js";

describe("Middleware | Validators | discord actions", function () {
  describe("validateGroupRoleBody", function () {
    it("lets the request pass to the next function", async function () {
      const res = {};
      const req = {
        body: {
          rolename: "test",
        },
      };
      const nextSpy = sinon.spy();
      await validateGroupRoleBody(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("stops the propagation of the event to next function", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      const req = {
        body: {},
      };
      await validateGroupRoleBody(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });

  describe("validateMemberRoleBody", function () {
    it("lets the request pass to the next function", async function () {
      const req = {
        body: {
          userid: "12346re54d4e434",
          roleid: "12345654325544565",
        },
      };
      const nextSpy = sinon.spy();
      const res = {};
      await validateMemberRoleBody(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("stops the propagation to the next function", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      const req = {
        body: {},
      };
      await validateMemberRoleBody(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });

  describe("validateUpdateUsersNicknameStatusBody", function () {
    it("should pass the request to the next function when lastNicknameUpdate timestamp is a string", async function () {
      const req = {
        body: {
          lastNicknameUpdate: String(Date.now()),
        },
      };
      const nextSpy = sinon.spy();
      const res = {};
      await validateUpdateUsersNicknameStatusBody(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should pass the request to the next function when lastNicknameUpdate timestamp is a number", async function () {
      const req = {
        body: {
          lastNicknameUpdate: Date.now(),
        },
      };
      const nextSpy = sinon.spy();
      const res = {};
      await validateUpdateUsersNicknameStatusBody(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should throw error when the lastNicknameUpdate timestamp is not present", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      const req = {
        body: {},
      };
      await validateMemberRoleBody(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });

  describe("validateLazyLoadingParams", function () {
    it("should pass the request to the next function when valid params are provided", async function () {
      const req = {
        query: {
          page: 1,
          size: 10,
          dev: "true",
        },
      };
      const nextSpy = sinon.spy();
      const res = {};
      await validateLazyLoadingParams(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should return a bad request error when size is out of range", async function () {
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const req = {
        query: {
          size: 200,
        },
      };
      const nextSpy = sinon.spy();
      await validateLazyLoadingParams(req, res, nextSpy);
      expect(nextSpy.called).to.be.equal(false);
      expect(res.boom.badRequest.calledOnce).to.be.equal(true);
    });

    it("should return a bad request error when page is negative", async function () {
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const req = {
        query: {
          page: -1,
        },
      };
      const nextSpy = sinon.spy();
      await validateLazyLoadingParams(req, res, nextSpy);
      expect(nextSpy.called).to.be.equal(false);
      expect(res.boom.badRequest.calledOnce).to.be.equal(true);
    });

    it("should return a bad request error when dev has an invalid value", async function () {
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const req = {
        query: {
          dev: "invalid",
        },
      };
      const nextSpy = sinon.spy();
      await validateLazyLoadingParams(req, res, nextSpy);
      expect(nextSpy.called).to.be.equal(false);
      expect(res.boom.badRequest.calledOnce).to.be.equal(true);
    });
  });
});
