const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const authCondition = require("../../../middlewares/authCondition.js");
const authenticate = require("../../../middlewares/authenticate.js"); // Middleware to be mocked

// eslint-disable-next-line mocha/no-exclusive-tests
describe.only("authCondition middleware", function () {
  let req, res, next;
  let authenticateStub;

  beforeEach(function () {
    sinon.restore();

    req = {
      query: {},
      cookies: {},
      headers: {
        authorization: "Bearer token", // mock authorization header
      },
      userData: { roles: {} }, // add userData to mock roles
    };

    res = {
      boom: {
        unauthorized: sinon.spy(),
        forbidden: sinon.spy(), // Add forbidden spy to test restricted access
      },
      cookie: sinon.spy(),
    };

    next = sinon.spy();

    // Stub authenticate middleware to control its behavior
    authenticateStub = sinon.stub(authenticate);
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should call authenticate when profile is true", async function () {
    req.query.profile = "true"; // Set profile to true
    authenticateStub.callsFake((req, res, next) => {
      // Call next to simulate successful authentication
      next();
    });

    await authCondition(req, res, next);

    expect(authenticateStub.calledOnce).to.equal(true);
    expect(next.calledOnce).to.equal(true); // Ensure next() was called once
  });

  it("should call next when profile is not true", async function () {
    req.query.profile = "false"; // Simulating profile=false
    authenticateStub.callsFake((req, res, next) => {
      // Call next to simulate successful authentication
      next();
    });

    await authCondition(req, res, next);

    // Assertion: authenticate should not be called when profile is false
    expect(authenticateStub.called).to.equal(false); // Ensure authenticate was NOT called
    expect(next.calledOnce).to.equal(true); // Ensure next() was called once
  });

  it("should respond with forbidden when user is restricted", async function () {
    req.query.profile = "true"; // Set profile to true
    req.userData.roles.restricted = true; // Simulate restricted role

    authenticateStub.callsFake((req, res, next) => {
      next(); // Call next to simulate successful authentication
    });

    await authCondition(req, res, next);

    expect(res.boom.forbidden.calledOnce).to.equal(true); // Ensure forbidden is called
    expect(next.called).to.equal(false); // Ensure next() was NOT called
  });
});
