const { RateLimiterMemory } = require("rate-limiter-flexible");
const {
  RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS,
  RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS,
  TOO_MANY_REQUESTS,
} = require("../constants/rateLimtingMiddelware");
const rateLimiterFastBruteByIP = new RateLimiterMemory(RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS);
const rateLimiterSlowBruteByIP = new RateLimiterMemory(RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS);

/**
 * @param msBeforeNext
 * @param fallbackValue seconds value to fallback on if `msBeforeNext` is falsy
 * @returns retrySeconds: number of seconds to wait before making next request
 */
function getRetrySeconds(msBeforeNext, fallbackValue = 1) {
  if (!msBeforeNext) return fallbackValue;
  return Math.round(msBeforeNext / 1000) || fallbackValue;
}

/**
 * @param req object represents the HTTP request and has property for the request ip address
 * @param res object represents the HTTP response that app sends when it get an HTTP request
 * @param next indicates the next middelware function
 * @returns Promise, which:
 *  - `resolved`  with next middelware function call `next()`
 *  - `resolved`  with response status set to 429 and message `Too Many Requests`  */
async function authorizationLimiter(req, res, next) {
  // INFO: get the clientIP when running behind a proxy
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  let retrySeconds = 0;
  try {
    const [responseRateLimiterFastBruteByIP, responseRateLimiterSlowBruteByIP] = await Promise.all([
      rateLimiterFastBruteByIP.get(ipAddress),
      rateLimiterSlowBruteByIP.get(ipAddress),
    ]);
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
    await Promise.all([rateLimiterFastBruteByIP.consume(ipAddress), rateLimiterSlowBruteByIP.consume(ipAddress)]);
    return next();
  } catch (error) {
    // INFO: sending raw seconds in response,
    // for letting API user decide how to represent this number.
    retrySeconds = getRetrySeconds(error?.msBeforeNext, retrySeconds);
    res.set({
      "Retry-After": `${retrySeconds}`,
      "X-RateLimit-Remaining": error.remainingPoints,
    });
    const message = `${TOO_MANY_REQUESTS.ERROR_TYPE}: Retry After ${retrySeconds} seconds, requests limit reached`;
    return res.status(TOO_MANY_REQUESTS.STATUS_CODE).json({ message });
  }
}

module.exports = {
  authorizationLimiter,
};
