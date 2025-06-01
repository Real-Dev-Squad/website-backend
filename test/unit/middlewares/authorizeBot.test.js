const authorizeBot = require("../../../middlewares/authorizeBot");
const sinon = require("sinon");
const expect = require("chai").expect;
const bot = require("../../utils/generateBotToken");
const jwt = require("jsonwebtoken");
const { HEADERS } = require("../../../constants/constants");
const { BAD_TOKEN, CLOUDFLARE_WORKER, CRON_JOB_HANDLER, DISCORD_SERVICE } = require("../../../constants/bot");

describe("Middleware | Authorize Bot", function () {
  describe("Check authorization of bot", function (done) {
    it("return false when token is invalid", function () {
      const request = {
        headers: `Bearer ${BAD_TOKEN}`,
      };

      const response = {
        statusCode: 401,
        error: "Unauthorized",
        message: "Unauthorized Bot",
      };

      const nextSpy = sinon.spy();
      authorizeBot.verifyDiscordBot(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
    });

    it("return false when header is not present", function () {
      const request = {};

      const response = {
        statusCode: 400,
        error: "Invalid Request",
        message: "Invalid Request",
      };

      const nextSpy = sinon.spy();
      authorizeBot.verifyDiscordBot(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
    });

    it("return true when token is valid", function () {
      const jwtToken = bot.generateToken({ name: CLOUDFLARE_WORKER });

      const request = {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      };

      const response = {};

      const nextSpy = sinon.spy();
      authorizeBot.verifyDiscordBot(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });
  });

  describe("Check Authorization of cron job", function () {
    it("Check fails on bad auth token", function () {
      const request = {
        headers: {
          authorization: `Bearer ${BAD_TOKEN}`,
        },
      };

      const response = {};

      const nextSpy = sinon.spy();

      authorizeBot.verifyCronJob(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
    });

    it("Should stop propagation for no auth token", function () {
      const request = {
        headers: {},
      };

      const response = {};

      const nextSpy = sinon.spy();

      authorizeBot.verifyCronJob(request, response, nextSpy).catch((err) => {
        expect(err).to.be.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });

    it("Should stop propagation for bad token data", function () {
      const jwtToken = bot.generateCronJobToken({ name: "Some Random Name" });
      const request = {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      };

      const response = {};

      const nextSpy = sinon.spy();

      authorizeBot.verifyCronJob(request, response, nextSpy).catch((err) => {
        expect(err).to.be.instanceOf(Error);
      });
      expect(nextSpy.calledOnce).to.be.equal(false);
    });

    it("Should allow request Propogation for valid request", function () {
      const jwtToken = bot.generateCronJobToken({ name: CRON_JOB_HANDLER });
      const request = {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      };
      const response = {};
      const nextSpy = sinon.spy();
      authorizeBot.verifyCronJob(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });
  });

  describe("Check authorization for discord service", function () {
    let nextSpy, boomBadRequestSpy, boomUnauthorizedSpy;

    beforeEach(function () {
      nextSpy = sinon.spy();
      boomBadRequestSpy = sinon.spy();
      boomUnauthorizedSpy = sinon.spy();
    });

    afterEach(function () {
      sinon.restore();
    });

    it("should return unauthorized when token is invalid for discord service", function () {
      const jwtStub = sinon.stub(jwt, "verify").throws(new Error("invalid token"));

      const request = {
        headers: {
          authorization: `Bearer ${BAD_TOKEN}`,
          [HEADERS.SERVICE_NAME]: DISCORD_SERVICE,
        },
      };

      const response = {
        boom: {
          unauthorized: boomUnauthorizedSpy,
        },
      };

      authorizeBot.verifyDiscordBot(request, response, nextSpy);

      expect(nextSpy.calledOnce).to.be.equal(false);
      expect(boomUnauthorizedSpy.calledOnce).to.be.equal(true);

      jwtStub.restore();
    });

    it("should return bad request when passing bad token in header for discord service", function () {
      const request = {
        headers: {
          authorization: `Bearer BAD_TOKEN`,
          [HEADERS.SERVICE_NAME]: DISCORD_SERVICE,
        },
      };

      const response = {
        boom: {
          badRequest: boomBadRequestSpy,
        },
      };

      authorizeBot.verifyDiscordBot(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
      expect(boomBadRequestSpy.calledOnce).to.be.equal(true);
    });

    it("should allow request propagation when token is valid for discord service", function () {
      const jwtToken = bot.generateDiscordServiceToken({ name: DISCORD_SERVICE });
      const request = {
        headers: {
          authorization: `Bearer ${jwtToken}`,
          [HEADERS.SERVICE_NAME]: DISCORD_SERVICE,
        },
      };

      authorizeBot.verifyDiscordBot(request, {}, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should allow request propagation when token is valid for cloudflare worker", function () {
      const jwtToken = bot.generateToken({ name: CLOUDFLARE_WORKER });
      const request = {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      };

      authorizeBot.verifyDiscordBot(request, {}, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("should return unauthorized when token is valid but not for discord service", function () {
      const jwtToken = bot.generateDiscordServiceToken({ name: "Invalid" });
      const request = {
        headers: {
          authorization: `Bearer ${jwtToken}`,
          [HEADERS.SERVICE_NAME]: DISCORD_SERVICE,
        },
      };

      const response = {
        boom: {
          unauthorized: boomUnauthorizedSpy,
        },
      };

      authorizeBot.verifyDiscordBot(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
      expect(boomUnauthorizedSpy.calledOnce).to.be.equal(true);
    });

    it("should return unauthorized when token is invalid for cloudflare worker", function () {
      const jwtToken = bot.generateToken({ name: "Invalid" });
      const request = {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      };

      const response = {
        boom: {
          unauthorized: boomUnauthorizedSpy,
        },
      };
      authorizeBot.verifyDiscordBot(request, response, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(false);
      expect(boomUnauthorizedSpy.calledOnce).to.be.equal(true);
    });
  });
});
