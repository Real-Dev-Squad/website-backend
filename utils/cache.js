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
      cacheStore.delete(key);
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

  return { get, set, hits, cacheStore };
};

// Initialize cache pool.
const pool = cachePool();

/**
 * Caching middleware for API resposnes.
 * @param {Object} [data] Options to handle individual api cache.
 * @param {number} data.priority The priority of api in cache store.
 * @param {number} data.expiry Cache expiry time of api in minutes.
 * @returns {function} middleware function to help cache api response.
 */
const cache = (data = { priority: 2, expiry: CACHE_EXPIRY_TIME_MIN }) => {
  return async (req, res, next) => {
    try {
      const key = "__cache__" + req.method + req.originalUrl;
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
            priority: data.priority,
            response: body,
            expiry: new Date().getTime() + minutesToMilliseconds(data.expiry),
            size: Buffer.byteLength(body),
          };
          pool.set(key, cacheValue);
          res.send = oldSend;
          return res.send(body);
        };

        next();
      }
    } catch (err) {
      logger.error(`Error while getting cached tasks response ${err}`);
      next();
    }
  };
};

module.exports = cache;
