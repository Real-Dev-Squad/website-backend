const authorizeBot = require("../../../middlewares/authorizeBot");
const sinon = require("sinon");
const expect = require("chai").expect;
const botVerifcation = require("../../../services/botVerificationService");
const { BAD_TOKEN } = require("../../../constants/bot");

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
    authorizeBot(request, response, nextSpy);
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
    authorizeBot(request, response, nextSpy);
    expect(nextSpy.calledOnce).to.be.equal(false);
  });

  it("return true when token is valid", function () {
    const jwtToken = botVerifcation.generateToken();

    const request = {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    };

    const response = {};

    const nextSpy = sinon.spy();
    authorizeBot(request, response, nextSpy);
    expect(nextSpy.calledOnce).to.be.equal(true);
  });
});
