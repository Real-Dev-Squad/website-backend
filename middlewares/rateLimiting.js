const { RateLimiterMemory } = require("rate-limiter-flexible");
const { TOO_MANY_REQUESTS } = require("../constants/rateLimiting");
const { getRetrySeconds } = require("../utils/rateLimiting");

// INFO: temporarily added here, will be take from env-var/config
const opts = {
  keyPrefix: "commonRateLimiter--login_fail_by_ip_per_minute",
  points: 5,
  duration: 30,
  blockDuration: 60 * 10,
};
const globalRateLimiter = new RateLimiterMemory(opts);

/**
 * @param req object represents the HTTP request and has property for the request ip address
 * @param res object represents the HTTP response that app sends when it get an HTTP request
 * @param next indicates the next middelware function
 * @returns Promise, which:
 *  - `resolved`  with next middelware function call `next()`
 *  - `resolved`  with response status set to 429 and message `Too Many Requests`  */
async function commonRateLimiter(req, res, next) {
  // INFO: get the clientIP when running behind a proxy
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  let retrySeconds = 0;
  try {
    const responseGlobalRateLimiter = await globalRateLimiter.get(ipAddress);
    if (responseGlobalRateLimiter && responseGlobalRateLimiter.consumedPoints > opts.points) {
      retrySeconds = getRetrySeconds(responseGlobalRateLimiter.msBeforeNext);
    }
    if (retrySeconds > 0) {
      throw Error();
    }
    await globalRateLimiter.consume(ipAddress);
    return next();
  } catch (error) {
    // INFO: sending raw seconds in response,``
    // for letting API user decide how to represent this number.
    retrySeconds = getRetrySeconds(error?.msBeforeNext, retrySeconds);
    res.set({
      "Retry-After": retrySeconds,
      "X-RateLimit-Limit": opts.points,
      "X-RateLimit-Remaining": error?.remainingPoints ?? 0,
      "X-RateLimit-Reset": new Date(Date.now() + error?.msBeforeNext),
    });
    const message = `${TOO_MANY_REQUESTS.ERROR_TYPE}: Retry After ${retrySeconds} seconds, requests limit reached`;
    return res.status(TOO_MANY_REQUESTS.STATUS_CODE).json({ message });
  }
}

module.exports = {
  commonRateLimiter,
};
