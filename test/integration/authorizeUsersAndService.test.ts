import { expect } from "chai";
import { authorizeOrAuthenticate } from "../../middlewares/authorizeUsersAndService";
import bot from "../utils/generateBotToken";
const userData = require("../fixtures/user/user")();
import authService from "../../services/authService";
import addUser from "../utils/addUser";
import cleanDb from "../utils/cleanDb";
const ROLES = require("../../constants/roles");
const { Services, CLOUDFLARE_WORKER, CRON_JOB_HANDLER } = require("../../constants/bot");
const cookieName = config.get("userToken.cookieName");
const express = require("express");
const router = express.Router();
const AppMiddlewares = require("../../middlewares");
const chai = require("chai");
const sinon = require("sinon");

import authorizeBot from "../../middlewares/authorizeBot";
import { CustomRequest, CustomResponse } from "../../types/global";
describe("Middleware | Authorization", function () {
  let req: any, res: any, next: any;
  const superUser = userData[4];
  const defaultUser = userData[0]; // user with no `roles` key
  let defaultJwt: string, superUserJwt: string;

  beforeEach(async () => {
    req = {
      headers: {},
    };
    res = {
      boom: {
        unauthorized: sinon.spy(),
        badRequest: sinon.spy(),
        badImplementation: sinon.spy(),
      },
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });
  describe("Input validations", function () {
    it("should throw an error for invalid roles", function () {
      expect(() => authorizeOrAuthenticate(["invalid_role"], [Services.CRON_JOB_HANDLER])).to.throw("Invalid role");
    });

    it("should throw an error for invalid services", function () {
      expect(() => authorizeOrAuthenticate([ROLES.APPOWNER], ["invalid_service"])).to.throw("Invalid service name");
    });
  });

  describe("Service Authorization", function () {
    it("should return unauthorized for invalid authorization header format", async function () {
      req.headers.authorization = "InvalidHeader";

      await authorizeOrAuthenticate([ROLES.APPOWNER], [Services.CRON_JOB_HANDLER])(req, res, next);
      expect(res.boom.unauthorized.calledOnce).to.be.equal(true);
    });

    it("should return unauthorized for invalid JWT token", async function () {
      req.headers.authorization = "Bearer invalid_token";
      await authorizeOrAuthenticate([ROLES.APPOWNER], [Services.CRON_JOB_HANDLER])(req, res, next);
      expect(res.boom.unauthorized.calledOnce).to.be.equal(true);
    });

    it("should call verifyCronJob for valid cron job token", async function () {
      const jwtToken = bot.generateCronJobToken({ name: CRON_JOB_HANDLER });
      req.headers.authorization = `Bearer ${jwtToken}`;
      await authorizeOrAuthenticate([ROLES.APPOWNER], [Services.CRON_JOB_HANDLER])(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("should call verifyDiscordBot for valid Discord bot token", async function () {
      const jwtToken = bot.generateToken({ name: CLOUDFLARE_WORKER });
      req.headers.authorization = `Bearer ${jwtToken}`;
      await authorizeOrAuthenticate([ROLES.APPOWNER], [Services.CLOUDFLARE_WORKER])(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("should return unauthorized for unknown service names", async function () {
      const jwtToken = bot.generateToken({ name: "Invalid name" });
      req.headers.authorization = `Bearer ${jwtToken}`;
      await authorizeOrAuthenticate([ROLES.APPOWNER], [Services.CLOUDFLARE_WORKER])(req, res, next);
      expect(res.boom.unauthorized.calledOnce).to.be.equal(true);
    });
  });
  describe("User Authorization", function () {
    const pongHandler = (_: CustomRequest, res: CustomResponse) => {
      return res.json({ message: "pong" });
    };

    router.get("/for-super-user", authorizeOrAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), pongHandler);

    const app = express();
    AppMiddlewares(app);
    app.use("/", router);

    beforeEach(async () => {
      const defaultUserId = await addUser(defaultUser);
      const superUserId = await addUser(superUser);
      defaultJwt = authService.generateAuthToken({ userId: defaultUserId });
      superUserJwt = authService.generateAuthToken({ userId: superUserId });
    });
    afterEach(async () => {
      await cleanDb();
    });
    it("should authorize super user for route with super_user required role", function (done) {
      chai
        .request(app)
        .get("/for-super-user")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err: Error, res: CustomResponse) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });
    it("should not authenticate invalid tokens", function (done) {
      const jwtToken = bot.generateCronJobToken({ name: CRON_JOB_HANDLER });
      chai
        .request(app)
        .get("/for-super-user")
        .set("cookie", `${cookieName}=${jwtToken}`)
        .end((err: Error, res: CustomResponse) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });
    it("should not allow default user for route with super_user required role", function (done) {
      chai
        .request(app)
        .get("/for-super-user")
        .set("cookie", `${cookieName}=${defaultJwt}`)
        .end((err: Error, res: CustomResponse) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });
    it("should allow services if user does not have authorization", function (done) {
      const jwtToken = bot.generateCronJobToken({ name: CRON_JOB_HANDLER });
      chai
        .request(app)
        .get("/for-super-user")
        .set("cookie", `${cookieName}=${defaultJwt}`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .end((err: Error, res: CustomResponse) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });
    it("should respond with status 500 for unknown errors", function (done) {
      const jwtToken = bot.generateCronJobToken({ name: CRON_JOB_HANDLER });
      sinon.stub(authorizeBot, "verifyCronJob").throws(new Error("Error"));
      chai
        .request(app)
        .get("/for-super-user")
        .set("Authorization", `Bearer ${jwtToken}`)
        .end((err: Error, res: CustomResponse) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          return done();
        });
    });
  });
});
