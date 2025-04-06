// @ts-nocheck

import { expect } from "chai";
import { authorizeAndAuthenticate  } from "../../middlewares/authorizeUsersAndService";
import { generateCronJobToken, generateToken } from "../utils/generateBotToken.js";
import userDataFixture from "../fixtures/user/user.js";
import { generateAuthToken } from "../../services/authService.js";
import addUser from "../utils/addUser";
import cleanDb from "../utils/cleanDb";
import ROLES from "../../constants/roles.js";
import { Services, CLOUDFLARE_WORKER, CRON_JOB_HANDLER } from "../../constants/bot.js";
import config from "config";
import express from "express";
import AppMiddlewares from "../../middlewares/index.js";
import chai from "chai";
import sinon from "sinon";

import * as authorizeBot from "../../middlewares/authorizeBot";
import { CustomRequest, CustomResponse } from "../../types/global";

const userData = userDataFixture();
const cookieName = config.get("userToken.cookieName");
const router = express.Router();

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
      expect(() => authorizeAndAuthenticate (["invalid_role"], [Services.CRON_JOB_HANDLER])).to.throw("Invalid role");
    });

    it("should throw an error for invalid services", function () {
      expect(() => authorizeAndAuthenticate ([ROLES.APPOWNER], ["invalid_service"])).to.throw("Invalid service name");
    });
  });

  describe("Service Authorization", function () {
    it("should return unauthorized for invalid authorization header format", async function () {
      req.headers.authorization = "InvalidHeader";

      await authorizeAndAuthenticate ([ROLES.APPOWNER], [Services.CRON_JOB_HANDLER])(req, res, next);
      expect(res.boom.unauthorized.calledOnce).to.be.equal(true);
    });

    it("should return unauthorized for invalid JWT token", async function () {
      req.headers.authorization = "Bearer invalid_token";
      await authorizeAndAuthenticate ([ROLES.APPOWNER], [Services.CRON_JOB_HANDLER])(req, res, next);
      expect(res.boom.unauthorized.calledOnce).to.be.equal(true);
    });

    it("should call verifyCronJob for valid cron job token", async function () {
      const jwtToken = generateCronJobToken({ name: CRON_JOB_HANDLER });
      req.headers.authorization = `Bearer ${jwtToken}`;
      await authorizeAndAuthenticate ([ROLES.APPOWNER], [Services.CRON_JOB_HANDLER])(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("should call verifyDiscordBot for valid Discord bot token", async function () {
      const jwtToken = generateToken({ name: CLOUDFLARE_WORKER });
      req.headers.authorization = `Bearer ${jwtToken}`;
      await authorizeAndAuthenticate ([ROLES.APPOWNER], [Services.CLOUDFLARE_WORKER])(req, res, next);
      expect(next.calledOnce).to.be.equal(true);
    });

    it("should return unauthorized for unknown service names", async function () {
      const jwtToken = generateToken({ name: "Invalid name" });
      req.headers.authorization = `Bearer ${jwtToken}`;
      await authorizeAndAuthenticate ([ROLES.APPOWNER], [Services.CLOUDFLARE_WORKER])(req, res, next);
      expect(res.boom.unauthorized.calledOnce).to.be.equal(true);
    });
  });
  describe("User Authorization", function () {
    const pongHandler = (_: CustomRequest, res: CustomResponse) => {
      return res.json({ message: "pong" });
    };

    router.get("/for-super-user", authorizeAndAuthenticate ([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), pongHandler);

    const app = express();
    AppMiddlewares(app);
    app.use("/", router);

    beforeEach(async () => {
      const defaultUserId = await addUser(defaultUser);
      const superUserId = await addUser(superUser);
      defaultJwt = generateAuthToken({ userId: defaultUserId });
      superUserJwt = generateAuthToken({ userId: superUserId });
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
      const jwtToken = generateCronJobToken({ name: CRON_JOB_HANDLER });
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
      const jwtToken = generateCronJobToken({ name: CRON_JOB_HANDLER });
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
      const jwtToken = generateCronJobToken({ name: CRON_JOB_HANDLER });
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
