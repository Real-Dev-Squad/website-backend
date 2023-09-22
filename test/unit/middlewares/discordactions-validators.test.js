const Sinon = require("sinon");
const {
  validateGroupRoleBody,
  validateMemberRoleBody,
  validateUpdateUsersNicknameStatusBody,
} = require("../../../middlewares/validators/discordactions");
const { expect } = require("chai");

describe("Middleware | Validators | discord actions", function () {
  describe("validateGroupRoleBody", function () {
    it("lets the request pass to the next function", async function () {
      const res = {};
      const req = {
        body: {
          rolename: "test",
        },
      };
      const nextSpy = Sinon.spy();
      await validateGroupRoleBody(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });
    it("stops the propogation of the event to next function", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
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
      const nextSpy = Sinon.spy();
      const res = {};
      await validateMemberRoleBody(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });
    it("stops the propogation to the next function", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
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
      const nextSpy = Sinon.spy();
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
      const nextSpy = Sinon.spy();
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
      const nextSpy = Sinon.spy();
      const req = {
        body: {},
      };
      await validateMemberRoleBody(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });

    it("should throw error when the lastNicknameUpdate timestamp is not a string or timestamp", async function () {
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      const req = {
        body: {
          lastNicknameUpdate: 112.45478,
        },
      };
      await validateMemberRoleBody(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
});
