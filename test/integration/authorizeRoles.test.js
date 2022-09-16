const chai = require("chai");
const { expect } = chai;

const authorizeRoles = require("../../middlewares/authorizeRoles");
const authenticate = require("../../middlewares/authenticate");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const config = require("config");
const cookieName = config.get("userToken.cookieName");
const userData = require("../fixtures/user/user")();

const { APPOWNER, SUPERUSER } = require("../../constants/roles");

const defaultUser = userData[0]; // user with no `roles` key
const appOwner = userData[3];
const superUser = userData[4];

// Route setup with various permissions for testing
const express = require("express");
const router = express.Router();
const AppMiddlewares = require("../../middlewares");

const pongHandler = (_, res) => {
  return res.json({ message: "pong" });
};

router.get("/for-app-owner", authenticate, authorizeRoles([APPOWNER]), pongHandler);
router.get("/for-super-user", authenticate, authorizeRoles([SUPERUSER]), pongHandler);
router.get("/for-super-user-and-app-owner", authenticate, authorizeRoles([SUPERUSER, APPOWNER]), pongHandler);
router.get("/for-invalid", authenticate, authorizeRoles(["invalid"]), pongHandler);

const app = express();
AppMiddlewares(app);
app.use("/", router);

describe("authorizeRoles", function () {
  let defaultJwt, appOwnerJwt, superUserJwt;

  before(async function () {
    const defaultUserId = await addUser(defaultUser);
    const appOwnerId = await addUser(appOwner);
    const superUserId = await addUser(superUser);
    defaultJwt = authService.generateAuthToken({ userId: defaultUserId });
    appOwnerJwt = authService.generateAuthToken({ userId: appOwnerId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });
  });

  after(async function () {
    await cleanDb();
  });

  describe("GET /for-app-owner", function () {
    it("should authorize app owner for route with app_owner required role", function (done) {
      chai
        .request(app)
        .get("/for-app-owner")
        .set("cookie", `${cookieName}=${appOwnerJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });

    it("should not allow default user for route with app_owner required role", function (done) {
      chai
        .request(app)
        .get("/for-app-owner")
        .set("cookie", `${cookieName}=${defaultJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });

    it("should not authorize super user for route with app_owner required role", function (done) {
      chai
        .request(app)
        .get("/for-app-owner")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });
  });

  describe("GET /for-super-user", function () {
    it("should authorize super user for route with super_user required role", function (done) {
      chai
        .request(app)
        .get("/for-super-user")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });

    it("should not allow app_owner for route with super_user required role", function (done) {
      chai
        .request(app)
        .get("/for-super-user")
        .set("cookie", `${cookieName}=${appOwnerJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });
  });

  describe("GET /for-super-user-and-app-owner", function () {
    it("should allow app owner for route with super_user or app_owner required role", function (done) {
      chai
        .request(app)
        .get("/for-super-user-and-app-owner")
        .set("cookie", `${cookieName}=${appOwnerJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });

    it("should allow super user for route with super_user or app_owner required role", function (done) {
      chai
        .request(app)
        .get("/for-super-user-and-app-owner")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });

    it("should not allow default user for route with super_user or app_owner required role", function (done) {
      chai
        .request(app)
        .get("/for-super-user-and-app-owner")
        .set("cookie", `${cookieName}=${defaultJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });
  });

  describe("GET /for-invalid", function () {
    it("should return server error for default user on route with invalid required role", function (done) {
      chai
        .request(app)
        .get("/for-invalid")
        .set("cookie", `${cookieName}=${defaultJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          return done();
        });
    });
    it("should return server error for super user on route with invalid required role", function (done) {
      chai
        .request(app)
        .get("/for-invalid")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          return done();
        });
    });
    it("should return server error for app owner on route with invalid required role", function (done) {
      chai
        .request(app)
        .get("/for-invalid")
        .set("cookie", `${cookieName}=${appOwnerJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          return done();
        });
    });
  });
});
