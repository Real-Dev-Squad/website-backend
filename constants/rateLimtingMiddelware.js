const RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS = {
  points: 100,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24,
  keyPrefix: "login_fail_by_ip_per_day",
};

const RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS = {
  keyPrefix: "login_fail_by_ip_per_minute",
  points: 5,
  duration: 30,
  blockDuration: 60 * 10,
};
const TOO_MANY_REQUESTS = {
  ERROR_TYPE: "Too Many Requests",
  STATUS_CODE: 429,
};

module.exports = {
  RATE_LIMITER_FAST_BRUTE_BY_IP_OPTIONS,
  RATE_LIMITER_SLOW_BRUTE_BY_IP_OPTIONS,
  TOO_MANY_REQUESTS,
};
