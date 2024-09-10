const Sinon = require("sinon");
const { expect } = require("chai");
const { validateSubscribe } = require("../../../middlewares/validators/subscription");

describe("Middleware | Validators | Subscription", function () {
  let req, res, nextSpy;

  beforeEach(function () {
    req = { body: {} };
    res = {
      status: Sinon.stub().returnsThis(),
      json: Sinon.stub(),
    };
    nextSpy = Sinon.spy();
  });

  it("should call next function when a valid request body is passed", async function () {
    req.body = {
      phoneNumber: "1234567890",
      email: "test@example.com",
    };

    await validateSubscribe(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.be.equal(true);
    expect(res.status.called).to.be.equal(false);
  });

  it("should return a 400 error when phoneNumber is missing", async function () {
    req.body = {
      email: "test@example.com",
    };

    await validateSubscribe(req, res, nextSpy);

    expect(nextSpy.called).to.be.equal(false);
    expect(res.status.calledOnceWith(400)).to.be.equal(true);
    expect(res.json.calledOnce).to.be.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property("error").that.includes('"phoneNumber" is required');
  });

  it("should return a 400 error when email is missing", async function () {
    req.body = {
      phoneNumber: "1234567890",
    };

    await validateSubscribe(req, res, nextSpy);

    expect(nextSpy.called).to.be.equal(false);
    expect(res.status.calledOnceWith(400)).to.be.equal(true);
    expect(res.json.calledOnce).to.be.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property("error").that.includes('"email" is required');
  });

  it("should return a 400 error when both phoneNumber and email are missing", async function () {
    req.body = {};

    await validateSubscribe(req, res, nextSpy);
    expect(nextSpy.called).to.be.equal(false);
    expect(res.status.calledOnceWith(400)).to.be.equal(true);
    expect(res.json.calledOnce).to.be.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property("error").that.includes('"phoneNumber" is required');
  });
});
