const authorizeBot = require("../../../middlewares/authorizeBot");
const sinon = require("sinon");
const expect = require("chai").expect;
const bot = require("../../utils/generateBotToken");
const { BAD_TOKEN, CLOUDFLARE_WORKER, CRON_JOB_HANDLER } = require("../../../constants/bot");

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
});
