const sinon = require("sinon");
const { validateJoinData, validateUsersPatchHandler } = require("./../../../middlewares/validators/user");
const joinData = require("./../../fixtures/user/join");
const userData = require("./../../fixtures/user/user");
const { expect } = require("chai");
const { updateUser } = require("./../../../middlewares/validators/user");

describe("Middleware | Validators | User", function () {
  describe("Create user validator for validateJoinData", function () {
    it("lets the request pass to next", async function () {
      const req = {
        body: joinData[0],
      };

      const res = {};
      const next = sinon.spy();
      await validateJoinData(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("Stops the propagation of the next", async function () {
      const req = {
        body: {
          firstName: "Neha",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await validateJoinData(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });
  });

  describe("User validator for usersPatchHandler", function () {
    it("should call the next for api archiveUsers", async function () {
      const req = {};

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const next = sinon.spy();
      await validateUsersPatchHandler(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("should call the next for api nonVerifiedDiscordUsers", async function () {
      const req = {
        body: {
          action: "nonVerifiedDiscordUsers",
        },
      };

      const res = {};

      const next = sinon.spy();
      await validateUsersPatchHandler(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("should stop the propagation of next", async function () {
      const req = {
        body: {
          action: "",
        },
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const next = sinon.spy();
      await validateUsersPatchHandler(req, res, next).catch((error) => {
        expect(error).to.be.an.instanceOf(Error);
      });
      expect(next.calledOnce).to.be.equal(false);
    });
  });

  describe("Create user validator for updateUser", function () {
    it("lets the request pass to next", async function () {
      const req = {
        body: userData[1],
      };

      const res = {};
      const next = sinon.spy();
      await updateUser(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("Stops the propagation of the next if twitter_id is invalid", async function () {
      const req = {
        body: {
          last_name: "patil",
          first_name: "Abhay",
          username: "invalidusername",
          twitter_id: "@abhayisawesome",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await updateUser(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });

    it("Stops the propagation of the next if username is invalid", async function () {
      const req = {
        body: {
          last_name: "patil",
          first_name: "Abhay",
          username: "@invalidusername-12",
          twitter_id: "abhayisawesome",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await updateUser(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });
  });
});
