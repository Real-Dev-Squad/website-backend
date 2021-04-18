const cache = require('memory-cache')

const set = (key, value, time = 7200000) => {
  return cache.put(key, value, time)
}

module.exports = {
  get: cache.get,
  set: set
}
