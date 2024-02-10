/**
 * @param msBeforeNext
 * @param fallbackValue seconds value to fallback on if `msBeforeNext` is falsy
 * @returns retrySeconds: number of seconds to wait before making next request
 */
function getRetrySeconds(msBeforeNext, fallbackValue = 1) {
  if (!msBeforeNext) return fallbackValue;
  return Math.round(msBeforeNext / 1000) || fallbackValue;
}

module.exports = {
  getRetrySeconds,
};
