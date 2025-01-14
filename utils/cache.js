const CACHE_EXPIRY_TIME_MIN = 0.1;
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
/**
 * A MultiMap implementation where each key maps to set of unique values.
 * It internally uses Map to store keys and values and to save multiple values it uses Set. Map<string,Set<string>>
 */
const cachedKeysStore = () => {
  const keyStore = new Map();

  /**
   * Returns set of values mapped to given key
   * @param {string} modelKey key for the map
   * @returns {Set} set of values
   */
  const getCachedKeys = (modelKey) => {
    if (!keyStore.has(modelKey)) {
      return new Set();
    }
    return keyStore.get(modelKey);
  };

  /**
   * Adds a value(cachedKey) for the given key(modelKey)
   * @param {string} modelKey key for the map
   * @param {string} cachedKey value for the given key
   *
   */
  const addCachedKey = (modelKey, cachedKey) => {
    if (keyStore.has(modelKey)) {
      keyStore.get(modelKey).add(cachedKey);
    } else {
      const set = new Set();
      set.add(cachedKey);
      keyStore.set(modelKey, set);
    }
  };
  /**
   * removes the given key(modelKey) and all of its associated values
   * @param {string} modelKey key for the map
   *
   */
  const removeModelKey = (modelKey) => {
    keyStore.delete(modelKey);
  };

  /**
   * remove a value(cachedKey) for the given key(modelKey)
   * @param {string} modelKey key for the map
   * @param {string} cachedKey value for the given key
   *
   */
  const removeCachedKey = (modelKey, cachedKey) => {
    if (keyStore.has(modelKey)) {
      keyStore.get(modelKey).delete(cachedKey);
    }
  };

  return { getCachedKeys, addCachedKey, removeModelKey, removeCachedKey };
};

// Initialize cache pool.
const pool = cachePool();

const cachedKeys = cachedKeysStore();

/**
 * Caching middleware for API resposnes.
 * @param {Object} [options] Options to handle individual api cache.
 * @param {number} options.priority The priority of api in cache store.
 * @param {number} options.expiry Cache expiry time of api in minutes.
 * @param {number} options.invalidationKey key to be used while using the invalidateCache middleware.
 * @returns {function} middleware function to help cache api response.
 */
const cacheResponse = (options = {}) => {
  const priority = options.priority || 2;
  const expiry = options.expiry || CACHE_EXPIRY_TIME_MIN;
  const modelKey = options.invalidationKey;
  return async (req, res, next) => {
    try {
      const key = generateCacheKey(req);
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
          if (res.statusCode < 200 || res.statusCode >= 300) {
            res.send = oldSend;
            return res.send(body);
          }

          const cacheValue = {
            priority: priority,
            response: body,
            expiry: new Date().getTime() + minutesToMilliseconds(expiry),
            size: Buffer.byteLength(body),
          };
          pool.set(key, cacheValue);
          if (modelKey) {
            cachedKeys.addCachedKey(modelKey, key);
          }
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
 * @param {Object} [request]  HTTP request argument to the middleware function passed by express.
 * @returns {string} cache key.
 */
const generateCacheKey = (request) => {
  return "cache:" + request.method + ":" + request.originalUrl;
};

/**
 * Invalidate the cache for given keys
 * @param {Object} [options]
 * @param {Object} [options.invalidationKeys] Array of invalidation keys used in cache middleware.
 * @returns {function} middleware function to help cache api response.
 */
const invalidateCache = (options = {}) => {
  const keys = options.invalidationKeys;

  if (!Array.isArray(keys)) {
    throw new Error("Invalidation keys must be an array");
  }

  return async (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return;
      }
      try {
        for (const key of keys) {
          const cachedKeysSet = cachedKeys.getCachedKeys(key);
          for (const cachedKey of cachedKeysSet) {
            pool.evict(cachedKey);
          }
          cachedKeys.removeModelKey(key);
        }
      } catch (err) {
        logger.error(`Error while removing cached response ${err}`);
      }
    });
    next();
  };
};

module.exports = { cacheResponse, invalidateCache, generateCacheKey, cachedKeysStore };
