const sinon = require("sinon");
const {
  validateJoinData,
  validateUsersPatchHandler,
  validateGenerateUsernameQuery,
} = require("./../../../middlewares/validators/user");
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
        body: {
          ...userData[1],
          first_name: "Ankush",
          last_name: "Dharkar",
        },
      };

      const res = {};
      const next = sinon.spy();
      await updateUser(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("lets role update request pass to next", async function () {
      const req = {
        body: {
          role: "developer",
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

    it("converts first_name to lowercase before passing to next", async function () {
      const req = {
        body: {
          first_name: "Ankush",
          last_name: "Dharkar",
        },
      };

      const res = {};
      const next = sinon.spy();
      await updateUser(req, res, next);

      expect(req.body.first_name).to.be.equal("ankush");
      expect(req.body.last_name).to.be.equal("dharkar");
      expect(next.calledOnce).to.be.equal(true);
    });

    it("converts last_name to lowercase before passing to next", async function () {
      const req = {
        body: {
          first_name: "ANKUSH",
          last_name: "DHARKAR",
        },
      };

      const res = {};
      const next = sinon.spy();
      await updateUser(req, res, next);

      expect(req.body.first_name).to.be.equal("ankush");
      expect(req.body.last_name).to.be.equal("dharkar");
      expect(next.calledOnce).to.be.equal(true);
    });

    it("stops the propagation of the next if first_name and last_name are not strings", async function () {
      const req = {
        body: {
          first_name: 12345,
          last_name: true,
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

  describe("Test the update Self Validator for disabled_roles property", function () {
    let req, res, nextSpy;

    beforeEach(function () {
      res = {
        boom: {
          badRequest: sinon.stub(), // Stub the badRequest method
        },
      };

      nextSpy = sinon.spy(); // Spy on the next function
    });

    it("Allows the request to pass with disabled_roles property []", async function () {
      req = {
        body: {
          disabledRoles: [],
        },
      };
      await updateUser(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("Allows the request to pass with disabled_roles property with roles `super_user` & `member'", async function () {
      req = {
        body: {
          disabledRoles: ["super_user", "member"],
        },
      };
      await updateUser(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("Allows the request to pass with disabled_roles property with role `member'", async function () {
      req = {
        body: {
          disabledRoles: ["member"],
        },
      };

      await updateUser(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("Allows the request to pass with disabled_roles property with role `super_user` ", async function () {
      req = {
        body: {
          disabledRoles: ["super_user"],
        },
      };
      await updateUser(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("shouldn't allow the request to pass with disabled_roles property with role `admin` ", async function () {
      req = {
        body: {
          disabledRoles: ["admin"],
        },
      };
      await updateUser(req, res, nextSpy);
      expect(res.boom.badRequest.calledOnce).to.be.equal(true);
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

    it("Allows the request pass to next", async function () {
      const req = {
        query: {
          profile: "true",
          dev: "true",
        },
      };

      const res = {};
      const next = sinon.spy();

      await getUsers(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("Allows the request with profileStatus parameter to pass to next", async function () {
      const req = {
        query: {
          profileStatus: "BLOCKED",
        },
      };

      const res = {};
      const next = sinon.spy();

      await getUsers(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("Stops the propagation when profileStatus is empty", async function () {
      const req = {
        query: {
          profileStatus: "",
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

    it("Stops the request for passing on to next", async function () {
      const req = {
        query: {
          profile: "false",
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

  describe("validateGenerateUsernameQuery Middleware", function () {
    it("should pass valid query parameters to next", async function () {
      const req = {
        query: {
          firstname: "John",
          lastname: "Doe",
          dev: "true",
        },
      };

      const res = {};
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("should return 400 for missing firstname", async function () {
      const req = {
        query: {
          lastname: "Doe",
          dev: "true",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            expect(message).to.equal("Invalid Query Parameters Passed");
          },
        },
      };
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.called).to.be.equal(false);
    });

    it("should return 400 for missing lastname", async function () {
      const req = {
        query: {
          firstname: "John",
          dev: "true",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            expect(message).to.equal("Invalid Query Parameters Passed");
          },
        },
      };
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.called).to.be.equal(false);
    });

    it("should return 400 for invalid firstname with special characters", async function () {
      const req = {
        query: {
          firstname: "John123",
          lastname: "Doe",
          dev: "true",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            expect(message).to.equal("Invalid Query Parameters Passed");
          },
        },
      };
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.called).to.be.equal(false);
    });

    it("should return 400 for invalid lastname with special characters", async function () {
      const req = {
        query: {
          firstname: "John",
          lastname: "Doe@",
          dev: "true",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            expect(message).to.equal("Invalid Query Parameters Passed");
          },
        },
      };
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.called).to.be.equal(false);
    });

    it("should return 400 for empty firstname", async function () {
      const req = {
        query: {
          firstname: "",
          lastname: "Doe",
          dev: "true",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            expect(message).to.equal("Invalid Query Parameters Passed");
          },
        },
      };
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.called).to.be.equal(false);
    });

    it("should return 400 for empty lastname", async function () {
      const req = {
        query: {
          firstname: "John",
          lastname: "",
          dev: "true",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            expect(message).to.equal("Invalid Query Parameters Passed");
          },
        },
      };
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.called).to.be.equal(false);
    });

    it("should pass without dev parameter", async function () {
      const req = {
        query: {
          firstname: "John",
          lastname: "Doe",
        },
      };

      const res = {};
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.calledOnce).to.be.equal(true);
    });

    it("should return 400 for invalid dev parameter", async function () {
      const req = {
        query: {
          firstname: "John",
          lastname: "Doe",
          dev: "false",
        },
      };

      const res = {
        boom: {
          badRequest: (message) => {
            expect(message).to.equal("Invalid Query Parameters Passed");
          },
        },
      };
      const next = sinon.spy();

      await validateGenerateUsernameQuery(req, res, next);

      expect(next.called).to.be.equal(false);
    });
  });
});
