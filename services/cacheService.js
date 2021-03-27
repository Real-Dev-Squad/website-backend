const cache = require('memory-cache')

module.exports = {
  get: cache.get,
  set: cache.put
}
