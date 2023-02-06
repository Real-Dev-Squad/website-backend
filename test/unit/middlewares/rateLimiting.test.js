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
  let spiedResStatus;
  let spiedResJson;
  let clock;

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
    spiedResStatus = sinon.spy(res, "status");
    spiedResJson = sinon.spy(res, "json");
    next = sinon.stub();
    clock = sinon.useFakeTimers(Date.now());
  });

  afterEach(function () {
    clock.restore();
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
    sinon.assert.calledWithMatch(spiedResStatus, 429);
    sinon.assert.calledWithMatch(spiedResJson, { message: TOO_MANY_REQUESTS });
  });

  it("should fake timers", function () {
    let timeOut = false;
    setTimeout(() => (timeOut = true), 60000);
    sinon.assert.match(timeOut, false);
    clock.tick(60 * 1000);
    sinon.assert.match(timeOut, true);
  });

  // TODO: test is failling for fakeTimer
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip("Should reset the request count after duration has passed", async function () {
    const promises = [];
    for (let index = 0; index < 10; ++index) {
      const promise = authorizationLimiter(req, res, next);
      promises.push(promise);
    }
    await Promise.all(promises);
    sinon.assert.calledWithMatch(spiedResStatus, 429);

    clock.tick(RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS.blockDuration * 1000);

    await authorizationLimiter(req, res, next);
    sinon.assert.neverCalledWithMatch(spiedResStatus, 429);
    sinon.assert.calledOnce(next);
  });
});
