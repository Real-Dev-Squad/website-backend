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
      phoneNumber: "+911234567890",
      email: "test@example.com",
    };

    validateSubscribe(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.be.equal(true);
    expect(res.status.called).to.be.equal(false);
    expect(res.json.called).to.be.equal(false);
  });

  it("should not return an error when phoneNumber is missing", async function () {
    req.body = {
      email: "test@example.com",
    };

    validateSubscribe(req, res, nextSpy);
    expect(nextSpy.calledOnce).to.be.equal(true);
    expect(res.status.called).to.be.equal(false);
    expect(res.json.called).to.be.equal(false);
  });

  it("should return a 400 error when email is missing", async function () {
    req.body = {
      phoneNumber: "+911234567890",
    };

    validateSubscribe(req, res, nextSpy);

    expect(nextSpy.called).to.be.equal(false);
    expect(res.status.calledOnceWith(400)).to.be.equal(true);
    expect(res.json.calledOnce).to.be.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property("error").that.includes('"email" is required');
  });

  it("should return a 400 error when both phoneNumber and email are missing", async function () {
    req.body = {};

    validateSubscribe(req, res, nextSpy);
    expect(nextSpy.called).to.be.equal(false);
    expect(res.status.calledOnceWith(400)).to.be.equal(true);
    expect(res.json.calledOnce).to.be.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property("error").that.includes('"email" is required');
  });

  it("should return a 400 error when email is not in correct format", async function () {
    req.body = {
      phoneNumber: "+911234567890",
      email: "invalid-email",
    };

    validateSubscribe(req, res, nextSpy);

    expect(nextSpy.called).to.be.equal(false);
    expect(res.status.calledOnceWith(400)).to.be.equal(true);
    expect(res.json.calledOnce).to.be.equal(true);
    expect(res.json.firstCall.args[0])
      .to.have.property("error")
      .that.includes('"email" with value "invalid-email" fails to match the required pattern');
  });

  it("should not return an error when phoneNumber is in correct format", async function () {
    req.body = {
      phoneNumber: "+911234567890",
      email: "test@example.com",
    };

    validateSubscribe(req, res, nextSpy);
    expect(nextSpy.calledOnce).to.be.equal(true);
    expect(res.status.called).to.be.equal(false);
    expect(res.json.called).to.be.equal(false);
  });

  it("should trim and validate phoneNumber if it contains leading or trailing spaces", async function () {
    req.body = {
      phoneNumber: "   +911234567890   ",
      email: "test@example.com",
    };

    validateSubscribe(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.be.equal(true);
    expect(res.status.called).to.be.equal(false);
    expect(res.json.called).to.be.equal(false);
    expect(req.body.phoneNumber).to.equal("+911234567890");
  });

  it("should return a 400 error when phoneNumber is in incorrect format", async function () {
    req.body = {
      phoneNumber: "invalid-number",
      email: "test@example.com",
    };

    validateSubscribe(req, res, nextSpy);

    expect(nextSpy.called).to.be.equal(false);
    expect(res.status.calledOnceWith(400)).to.be.equal(true);
    expect(res.json.calledOnce).to.be.equal(true);
    expect(res.json.firstCall.args[0])
      .to.have.property("error")
      .that.includes('"phoneNumber" with value "invalid-number" fails to match the required pattern');
  });
});
