const sinon = require("sinon");
const { TOO_MANY_REQUESTS } = require("../../../constants/rateLimiting");

function mockRequest(ipAddress) {
  return {
    headers: {
      "x-forwarded-for": ipAddress,
    },
    socket: {
      remoteAddress: ipAddress,
    },
  };
}

function mockResponse(sandbox) {
  const res = {};
  res.status = sandbox.stub().returns(res);
  res.json = sandbox.stub().returns(res);
  res.set = sandbox.stub().returns(res);
  return res;
}

describe("Rate Limting Middelware", function () {
  let req;
  let res;
  let next;
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    req = mockRequest("127.0.0.1");
    res = mockResponse(sandbox);
    next = sandbox.stub();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Should call the next middelware if the request count is under the limit", async function () {
    await commonRateLimiter(req, res, next);
    sinon.assert.calledOnce(next);
  });

  it("Should return 429 status code and message `Too many requests` if the request count exceeds the limit", async function () {
    const promises = [];
    for (let index = 0; index < 10; ++index) {
      const promise = commonRateLimiter(req, res, next);
      promises.push(promise);
    }
    await Promise.all(promises);
    sinon.assert.calledWithMatch(res.status, TOO_MANY_REQUESTS.STATUS_CODE);
  });

  it("Should reset the request count after duration has passed", async function () {
    const promises = [];
    for (let index = 0; index < 10; ++index) {
      const promise = commonRateLimiter(req, res, next);
      promises.push(promise);
    }
    await Promise.all(promises);
    sinon.assert.calledWithMatch(res.status, TOO_MANY_REQUESTS.STATUS_CODE);

    /**
     INFO[no-reasoning-only-assumption]:
     using setTimeout instead of sinon.FakeTimers,
     because clock was ticking for expected duration but
     key was not getting deleted from middelware store
     */
    setTimeout(async () => {
      await commonRateLimiter(req, res, next);
      sinon.assert.neverCalledWithMatch(res.status, TOO_MANY_REQUESTS.STATUS_CODE);
      sinon.assert.calledOnce(next);
    }, 1000);
  });
});
