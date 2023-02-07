const { RateLimiterMemory } = require("rate-limiter-flexible");
const {
  RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS,
  RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS,
  TOO_MANY_REQUESTS,
} = require("../constants/rateLimtingMiddelware");
const rateLimiterFastBruteByIP = new RateLimiterMemory(RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS);
const rateLimiterSlowBruteByIP = new RateLimiterMemory(RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS);

function getRetrySeconds(msBeforeNext) {
  if (!msBeforeNext) return 1;
  return Math.round(msBeforeNext / 1000) || 1;
}

/**
 * @param req object represents the HTTP request and has property for the request ip address
 * @param res object represents the HTTP response that app sends when it get an HTTP request
 * @param next indicates the next middelware function
 * @returns Promise, which:
 *  - `resolved`  with next middelware function call `next()`
 *  - `resolved`  with response status set to 429 and message `Too Many Requests`  */
// TODO: check use of async middelware
// TODO: refactor @utils
async function authorizationLimiter(req, res, next) {
  // TODO: check for proxy
  const ipAddress = req.ip;
  let retrySeconds = 0;
  try {
    const [responseRateLimiterFastBruteByIP, responseRateLimiterSlowBruteByIP] = await Promise.all([
      rateLimiterFastBruteByIP.get(ipAddress),
      rateLimiterSlowBruteByIP.get(ipAddress),
    ]);
    // INFO: checks is IP blocked and update retry seconds duration
    if (
      responseRateLimiterFastBruteByIP &&
      responseRateLimiterFastBruteByIP.consumedPoints > RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS.points
    ) {
      retrySeconds = getRetrySeconds(responseRateLimiterFastBruteByIP.msBeforeNext);
    } else if (
      responseRateLimiterSlowBruteByIP &&
      responseRateLimiterSlowBruteByIP.consumedPoints > RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS.points
    ) {
      retrySeconds = getRetrySeconds(responseRateLimiterSlowBruteByIP.msBeforeNext);
    }
    if (retrySeconds > 0) {
      throw Error();
    }
    // TODO: get retrySeconds after consume response
    await Promise.all([rateLimiterFastBruteByIP.consume(ipAddress), rateLimiterSlowBruteByIP.consume(ipAddress)]);
    return next();
  } catch (error) {
    // TODO: get retrySeconds from error
    // INFO: sending raw seconds in response,
    // for letting API user decide how to represent this number.
    res.set({
      "Retry-After": `${retrySeconds}`,
    });
    retrySeconds = getRetrySeconds(error?.msBeforeNext);
    const message = `${TOO_MANY_REQUESTS.ERROR_TYPE}: Retry After ${retrySeconds} seconds, requests limit reached`;
    return res.status(TOO_MANY_REQUESTS.STATUS_CODE).json({ message });
  }
}

module.exports = {
  authorizationLimiter,
};
