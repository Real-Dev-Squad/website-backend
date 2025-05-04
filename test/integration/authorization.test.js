import chai from "chai";

import { authorizeUser } from "../../middlewares/authorization.js";
import authenticate from "../../middlewares/authenticate.js";
import * as authService from "../../services/authService.js";
import addUser from "../utils/addUser.js";
import cleanDb from "../utils/cleanDb.js";
import config from "config";
import userData from "../fixtures/user/user.js";

// Setup some routes with various permissions for testing
import express from "express";
import AppMiddlewares from "../../middlewares/index.js";
const { expect } = chai;
const cookieName = config.get("userToken.cookieName");

const defaultUser = userData[0]; // user with no `roles` key
const appOwner = userData[3];
const superUser = userData[4];
const router = express.Router();

const pongHandler = (_, res) => {
  return res.json({ message: "pong" });
};

router.get("/for-everyone", authenticate, pongHandler);
router.get("/for-app-owner", authenticate, authorizeUser("appOwner"), pongHandler);
router.get("/for-super-user", authenticate, authorizeUser("superUser"), pongHandler);

const app = express();
AppMiddlewares(app);
app.use("/", router);

describe("authorizeUser", function () {
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

  it("should authorize default user for route with no required role", function (done) {
    chai
      .request(app)
      .get("/for-everyone")
      .set("cookie", `${cookieName}=${defaultJwt}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        return done();
      });
  });

  it("should authorize user with role for route with no required role", function (done) {
    chai
      .request(app)
      .get("/for-everyone")
      .set("cookie", `${cookieName}=${appOwnerJwt}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        return done();
      });
  });

  it("should authorize appOwner for route with appOwner required role", function (done) {
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

  it("should not allow user not having role for route with appOwner required role", function (done) {
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

  it("should authorize superUser for route with appOwner required role", function (done) {
    chai
      .request(app)
      .get("/for-app-owner")
      .set("cookie", `${cookieName}=${superUserJwt}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        return done();
      });
  });

  it("should authorize superUser for route with superUser required role", function (done) {
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

  it("should not allow appOwner for route with superUser required role", function (done) {
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
