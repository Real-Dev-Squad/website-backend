const chai = require("chai");
const sinon = require("sinon");
const { assert } = chai;
const skipAuthorizeRolesUnderFF = require("../../../middlewares/skipAuthorizeRolesWrapper");

describe("skipAuthorizeRolesUnderFF Middleware", function () {
  let req, res, next, authorizeMiddleware;

  beforeEach(function () {
    req = { query: {} };
    res = {};
    next = sinon.spy();
    authorizeMiddleware = sinon.spy();
  });

  it("should call next() when dev is true", function () {
    req.query.dev = "true";

    const middleware = skipAuthorizeRolesUnderFF(authorizeMiddleware);
    middleware(req, res, next);

    assert.isTrue(next.calledOnce, "next() should be called once");
    assert.isFalse(authorizeMiddleware.called, "authorizeMiddleware should not be called");
  });

  it("should call authorizeMiddleware when dev is false", function () {
    req.query.dev = "false";

    const middleware = skipAuthorizeRolesUnderFF(authorizeMiddleware);
    middleware(req, res, next);

    assert.isTrue(authorizeMiddleware.calledOnce, "authorizeMiddleware should be called once");
    assert.isFalse(next.called, "next() should not be called");
  });

  it("should call authorizeMiddleware when dev is not provided", function () {
    const middleware = skipAuthorizeRolesUnderFF(authorizeMiddleware);
    middleware(req, res, next);

    assert.isTrue(authorizeMiddleware.calledOnce, "authorizeMiddleware should be called once");
    assert.isFalse(next.called, "next() should not be called");
  });
});
