const sinon = require("sinon");
const { validateJoinData, validateUsersPatchHandler } = require("./../../../middlewares/validators/user");
const joinData = require("./../../fixtures/user/join");
const userData = require("./../../fixtures/user/user");
const { expect } = require("chai");
const { updateUser, getUsers } = require("./../../../middlewares/validators/user");

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

    it("lets roles update request pass to next", async function () {
      const req = {
        body: {
          roles: {
            maven: true,
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

    it("Stops the propagation of the next if twitter_id is valid", async function () {
      const req = {
        body: {
          last_name: "patil",
          first_name: "Abhay",
          username: "invalidusername",
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
      expect(nextSpy.calledOnce).to.be.equal(true);
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

    it("Stops the propagation of the next if linkedin id is invalid or contain spaces", async function () {
      const req = {
        body: {
          last_name: "patil",
          first_name: "Abhay",
          username: "invalidusername12",
          twitter_id: "abhayisawesome",
          linkedin_id: "abhay 2011",
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

    it("Allows a valid username", async function () {
      const req = {
        body: {
          username: "john-doe",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            throw new Error(message);
          },
        },
      };

      const next = sinon.spy();

      await updateUser(req, res, next);

      expect(next.calledOnce).to.be.equal(true);
    });

    it("Stops the propagation of next for an invalid username", async function () {
      const req = {
        body: {
          username: "@john_doe",
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

  describe("Create user validator for getUsers", function () {
    it("lets the request pass to next", async function () {
      const req = {
        query: {
          filterBy: "unmerged_prs",
          days: "30",
        },
      };

      const res = {};
      const next = sinon.spy();

      await getUsers(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("Stops the propagation of the next", async function () {
      const req = {
        query: {
          filterBy: 45,
        },
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();

      await getUsers(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });
  });
});
