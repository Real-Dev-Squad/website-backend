const { RateLimiterMemory } = require("rate-limiter-flexible");
const {
  RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS,
  RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS,
  TOO_MANY_REQUESTS,
} = require("../constants/rateLimtingMiddelware");

const rateLimiterFastBruteByIP = new RateLimiterMemory(RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS);
const rateLimiterSlowBruteByIP = new RateLimiterMemory(RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS);

/**
 * @param req object represents the HTTP request and has property for the request ip address
 * @param res object represents the HTTP response that app sends when it get an HTTP request
 * @param next indicates the next middelware function
 * @returns Promise, which:
 *  - `resolved`  with next middelware function call `next()`
 *  - `resolved`  with response status set to 429 and message `Too Many Requests`  */
// TODO: check use of async middelware
async function authorizationLimiter(req, res, next) {
  // TODO: check for proxy
  const ipAddress = req.ip;
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
      retrySeconds = Math.round(responseRateLimiterFastBruteByIP.msBeforeNext / 1000) || 1;
    } else if (
      responseRateLimiterSlowBruteByIP &&
      responseRateLimiterSlowBruteByIP.consumedPoints > RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS.points
    ) {
      retrySeconds = Math.round(responseRateLimiterSlowBruteByIP.msBeforeNext / 1000) || 1;
    }
    if (retrySeconds > 0) {
      throw Error(TOO_MANY_REQUESTS);
    }
    await Promise.all([rateLimiterFastBruteByIP.consume(ipAddress), rateLimiterSlowBruteByIP.consume(ipAddress)]);
    return next();
  } catch (error) {
    // TODO: add a method to send rateLimit limit, remaining, and reset
    // TODO: check for use of response-boom here
    res.set({
      "Retry-After": `${retrySeconds}`,
    });
    return res.status(429).json({ message: TOO_MANY_REQUESTS });
  }
}

module.exports = {
  authorizationLimiter,
};
