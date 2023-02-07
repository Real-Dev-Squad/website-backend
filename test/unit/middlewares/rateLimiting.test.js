const sinon = require("sinon");
const {
  TOO_MANY_REQUESTS,
  RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS,
} = require("../../../constants/rateLimtingMiddelware");
const { authorizationLimiter } = require("../../../middlewares/rateLimiting");

describe("Rate Limting Middelware", function () {
  let req;
  let res;
  let next;
  let resStatusSpy;

  beforeEach(function () {
    req = {
      ip: "148.56.7764.4",
    };
    // TODO: use a strong/better way for using spies
    res = {
      status() {
        return this;
      },
      set() {
        return this;
      },
      json() {
        return this;
      },
    };
    resStatusSpy = sinon.spy(res, "status");
    next = sinon.stub();
    RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS.blockDuration = 1 * 10;
  });

  it("Should call the next middelware if the request count is under the limit", async function () {
    await authorizationLimiter(req, res, next);
    sinon.assert.calledOnce(next);
  });

  it("Should return 429 status code and message `Too many requests` if the request count exceeds the limit", async function () {
    const promises = [];
    for (let index = 0; index < 10; ++index) {
      const promise = authorizationLimiter(req, res, next);
      promises.push(promise);
    }
    await Promise.all(promises);
    sinon.assert.calledWithMatch(resStatusSpy, TOO_MANY_REQUESTS.STATUS_CODE);
  });

  it("Should reset the request count after duration has passed", async function () {
    const promises = [];
    for (let index = 0; index < 10; ++index) {
      const promise = authorizationLimiter(req, res, next);
      promises.push(promise);
    }
    await Promise.all(promises);
    sinon.assert.calledWithMatch(resStatusSpy, TOO_MANY_REQUESTS.STATUS_CODE);

    /**
     INFO[no-reasoning-only-assumption]:
     using setTimeout not sinon.FakeTimers,
     because clock was ticking for expected duration but
     key was not getting deleted from middelware store
     */
    setTimeout(async () => {
      await authorizationLimiter(req, res, next);
      sinon.assert.neverCalledWithMatch(resStatusSpy, TOO_MANY_REQUESTS.STATUS_CODE);
      sinon.assert.calledOnce(next);
    }, RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS.blockDuration * 1000);
  });
});
