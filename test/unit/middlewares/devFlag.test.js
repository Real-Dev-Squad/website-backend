const { expect } = require("chai");
const { devFlagMiddleware } = require("../../../middlewares/devFlag");
const sinon = require("sinon");

describe("devFlagMiddleware", function () {
  let req;
  let res;
  let next;

  beforeEach(function () {
    req = {
      query: {},
    };
    res = {
      boom: {
        notFound: sinon.spy((message) => {
          res.status = 404;
          res.message = message;
        }),
      },
    };
    next = sinon.spy();
  });

  it("should call next() if dev query parameter is true", function () {
    req.query.dev = "true";
    devFlagMiddleware(req, res, next);
    return expect(next.calledOnce).to.be.equal(true);
  });

  it("should return 404 if dev query parameter is not true", function () {
    req.query.dev = "false";

    devFlagMiddleware(req, res, next);

    expect(res.status).to.equal(404);
    expect(res.message).to.equal("Route not found");
    return expect(next.notCalled).to.be.equal(true);
  });

  it("should return 404 if dev query parameter is missing", function () {
    devFlagMiddleware(req, res, next);

    expect(res.status).to.equal(404);
    expect(res.message).to.equal("Route not found");
    return expect(next.notCalled).to.be.equal(true);
  });

  it("should call next(err) if an error occurs", function () {
    res.boom.notFound = sinon.stub().throws(new Error("Test error"));

    devFlagMiddleware(req, res, next);

    expect(next.calledOnce).to.be.equal(true);
    expect(next.args[0][0]).to.be.instanceOf(Error);
    return expect(next.args[0][0].message).to.equal("Test error");
  });
});
