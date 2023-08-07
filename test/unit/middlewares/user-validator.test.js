const sinon = require("sinon");
const { validateJoinData } = require("./../../../middlewares/validators/user");
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

    it("lets roles update request pass to next", async function () {
      const req = {
        body: {
          roles: {
            archived: false,
            in_discord: false,
            developer: true,
          },
        },
      };

      const res = {};
      const next = sinon.spy();
      await updateUser(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("Stops the propagation of the next if required roles missing", async function () {
      const req = {
        body: {
          roles: {
            in_discord: false,
            developer: true,
          },
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

    it("Stops the propagation of the next if instagram_id is invalid", async function () {
      const req = {
        body: {
          last_name: "patil",
          first_name: "Abhay",
          username: "invalidusername",
          instagram_id: "@abhayisawesome",
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

    it("Stops the propagation of the next if linkedin id is invalid", async function () {
      const req = {
        body: {
          last_name: "patil",
          first_name: "Abhay",
          username: "invalidusername12",
          twitter_id: "abhayisawesome",
          linkedin_id: "@abhay2011",
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
