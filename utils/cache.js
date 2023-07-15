const CACHE_EXPIRY_TIME_MIN = 2;
const CACHE_SIZE_MB = 10;
const minutesToMilliseconds = (minutes) => minutes * 60000;

/**
 * Cache pool to get and store API responses
 * @param {Object} [opt] options for cache pool
 * @param {number} opt.maximumSize Maximum size of the cache pool in Megabytes (MB)
 */
const cachePool = (opt = { maximumSize: CACHE_SIZE_MB }) => {
  const cacheStore = new Map();
  let hits = 0;

  /**
   * Get an API Response from cacheStore.
   * @param {string} key
   * @returns {null | object}
   */
  const get = (key) => {
    const cachedData = cacheStore.get(key);

    if (!cachedData) {
      return null;
    }

    const isCacheDataExpired = new Date().getTime() > cachedData.expiry;

    // If data is expired remove it from store, time to get a fresh copy.
    if (isCacheDataExpired) {
      evict(key);
      return null;
    }

    hits += 1;
    try {
      return JSON.parse(cachedData.response);
    } catch (err) {
      logger.error(`Error while parsing cachedData.response ${err}`);
      throw err;
    }
  };

  /**
   * Remove an API Response from cacheStore.
   * @param {string} key
   * @returns {boolean}
   */
  const evict = (key) => {
    return cacheStore.delete(key);
  };

  /**
   * Add API response to cacheStore.
   * @param {string} key
   * @param {Object} value Value to be stored inside the cache.
   * @param {number} value.priority Priority of the api
   * @param {string} value.response Response from controller
   * @param {number} value.expiry Expiry time of api
   * @param {number} value.size Size of api response in byte
   * @returns {number} : statusCode
   */
  const set = async (key, value) => {
    try {
      cacheStore.set(key, value);
      return true;
    } catch (err) {
      return false;
    }
  };

  return { get, set, evict, hits, cacheStore };
};

// Initialize cache pool.
const pool = cachePool();

/**
 * Caching middleware for API resposnes.
 * @param {string} key Cache key.
 * @param {number} expiry Cache expiry time of api in minutes.
 * @param {number} priority The priority of api in cache store.
 * @returns {function} middleware function to help cache api response.
 */
const cache = (key, expiry = CACHE_EXPIRY_TIME_MIN, priority = 2) => {
  return async (req, res, next) => {
    try {
      if (!key) {
        key = generateCacheKey(req);
      }

      const cacheData = pool.get(key);

      if (cacheData) {
        res.send(cacheData);
      } else {
        /**
         * As we do not have data in our cache we call the next middleware,
         * intercept the response being sent from middleware and store it in cache.
         *  */
        const oldSend = res.send;

        res.send = (body) => {
          const cacheValue = {
            priority: priority,
            response: body,
            expiry: new Date().getTime() + minutesToMilliseconds(expiry),
            size: Buffer.byteLength(body),
          };
          pool.set(key, cacheValue);
          res.send = oldSend;
          return res.send(body);
        };

        next();
      }
    } catch (err) {
      logger.error(`Error while getting cached response ${err}`);
      next();
    }
  };
};

/**
 * Generate key to save cache.
 * @param {Object} [data] Options to generate cache key.
 * @param {number} data.method api method name.
 * @param {number} data.originalUrl api url.
 * @returns {string} cache key.
 */
const generateCacheKey = (data) => {
  return "__cache__" + data.method + data.originalUrl;
};

/**
 * Invalidate the cache for given keys
 * @param {Array} [cacheKeys] Array of cache keys.
 * @returns {function} middleware function to help cache api response.
 */
const invalidateCache = (cacheKeys) => {
  return async (req, res, next) => {
    try {
      if (Array.isArray(cacheKeys)) {
        for (const key of cacheKeys) {
          pool.evict(key);
        }
      }
    } catch (err) {
      logger.error(`Error while removing cached response ${err}`);
    } finally {
      next();
    }
  };
};

module.exports = { cache, invalidateCache, generateCacheKey };
