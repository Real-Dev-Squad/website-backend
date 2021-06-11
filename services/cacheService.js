const {
  get,
  put,
  ...cache
} = require('memory-cache')

/**
 * Set in memory cache
 * @param {(string|symbol)} key
 * @param {*} value
 * @param {number} [time=<cache.ttl.default>]
 */
const set = (key, value, time = config.get('cache.ttl.default')) => {
  return put(key, value, time)
}

// Check the APIs available at https://www.npmjs.com/package/memory-cache
module.exports = {
  get,
  set,
  ...cache
}
