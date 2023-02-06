const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const { authorizationLimiter } = require("../../../middlewares/rateLimiting");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Rate Limting Middelware", function () {
  let req;
  let res;
  let next;
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    req = {};
    res = {};
    next = sinon.stub();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Should call the next middelware if the request count is under the limit", function () {
    authorizationLimiter(req, res, next);
    expect(next.calledOnce).to.be.true();
  });

  it("Should return 429 status code and message `Too many requests` if the request count exceeds the limit", function () {
    for (let index = 0; index < 11; ++index) {
      authorizationLimiter(req, res, next);
    }
    expect(res).to.have.status(429);
  });

  it("Should reset the request count after duration has passed", function (done) {
    for (let index = 0; index < 11; ++index) {
      authorizationLimiter(req, 10, next);
    }
    expect(res).to.have.status(429);

    setTimeout(function () {
      authorizationLimiter(req, res, next);
      expect(res.statusCode).to.not.equal(429);
      expect(next.calledOnce).to.be.true();
      done();
    }, 10 * 60 * 1000);
  });
});
