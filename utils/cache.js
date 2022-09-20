const CACHEEXPIRYTIME = 2; // Default cache expriy time in Minutes
const minutesToMilliseconds = (minutes) => minutes * 60000; // Converts given minutes into milliseconds

const globalStore = () => {
  const cacheStore = new Map();
  let hits = 0;

  /**
   * Get an API Respnose from cacheStore.
   * @param {string} key
   * @returns {null | object}
   */
  const get = (key) => {
    const apiData = cacheStore.get(key);

    if (!apiData) {
      return null;
    }

    const isApiDataExpired = new Date().getTime() > apiData.expiry;

    // If data is expired remove it from store, time to get a fresh copy.
    if (isApiDataExpired) {
      cacheStore.delete(key);
      return null;
    }

    hits += 1;
    return apiData.response;
  };

  /**
   * Add API response to our cacheStore.
   * @param {string} key {string}
   * @param {Object} value Value to be stored inside the cache.
   * @param {number} value.priority Priority of the api
   * @param {number} value.expiry Expiry time of api
   * @param {number} value.size Size of api response in byte
   * @returns {number} : statusCode
   */
  const set = async (key, value) => {
    try {
      cacheStore.set(key, value);
      return 200;
    } catch (err) {
      return 500;
    }
  };

  return { get, set, hits, cacheStore };
};

// Initialize globalstore to be used.
const store = globalStore();

/**
 * Caching middleware for API resposnes.
 * @param {Object} [data] Options to handle individual api cache.
 * @param {number} data.priority The priority of api in cache store.
 * @param {number} data.expiry Cache expiry time of api in minutes.
 * @returns {function} middleware function to help cache api response.
 */
const cache = (data = { priority: 2, expiry: CACHEEXPIRYTIME }) => {
  return async (req, res, next) => {
    const key = "__cache__" + req.method + req.originalUrl;
    const dataInCache = store.get(key);

    if (dataInCache) {
      res.send(dataInCache);
    } else {
      /**
       * As we do not have data in our cache we call the next middleware,
       * intercept the response being sent from middleware and store it in cache.
       *  */
      const chunks = [];
      const oldWrite = res.write;
      const oldEnd = res.end;

      res.write = (chunk, ...args) => {
        chunks.push(chunk);
        return oldWrite.apply(res, [chunk, ...args]);
      };

      res.end = (chunk, ...args) => {
        if (chunk) {
          chunks.push(chunk);
        }

        const apiResponse = Buffer.concat(chunks).toString();

        const cacheValue = {
          priority: data.priority,
          response: apiResponse,
          expiry: new Date().getTime() + minutesToMilliseconds(data.expiry),
          size: Buffer.byteLength(apiResponse),
        };

        store.set(key, cacheValue);
        return oldEnd.apply(res, [chunk, ...args]);
      };

      next();
    }
  };
};

module.exports = cache;
