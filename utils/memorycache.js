const globalStore = (cacheTime = 6 * 10000) => {
    const cacheStore = new Map();
    let hits = 0;

    /**
     * Get an API Respnose from our cacheStore.
     * @param key {string}
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
        return apiData.data;
    };

    /**
     * Add API response to our cacheStore.
     * @param key {string}
     * @param value {object | array}
     * @returns {integer} : statusCode
     */
    const set = async (key, value) => {
        const expiryTime = new Date().getTime() + cacheTime;
        const dataToStore = { expiry: expiryTime, data: value };

        try {
            cacheStore.set(key, dataToStore);
            return 200;
        } catch (err) {
            return 500;
        }
    };

    return { get, set, hits };
};

// Initialize globalstore to be used.
const store = globalStore();

/**
 * Caching middleware to help us cache API resposne.
 * @param days {integer} : to be converted
 * @returns {integer} : in milliseconds
 */
const cache = (req, res, next) => {
    const key = "__cache__" + req.method + req.originalUrl;
    const dataInCache = store.get(key);

    if (dataInCache) {
        res.send(dataInCache);
    } else {
        /**
         * As we do not have data in our cache we call the next middleware,
         * intercept the response being sent from middleware and store it in cache.
         *  */
        const oldWrite = res.write;
        const oldEnd = res.end;

        const chunks = [];

        res.write = (chunk, ...args) => {
            chunks.push(chunk);
            return oldWrite.apply(res, [chunk, ...args]);
        };

        res.end = (chunk, ...args) => {
            if (chunk) {
                chunks.push(chunk);
            }
            const body = Buffer.concat(chunks).toString("utf8");
            const apiData = JSON.parse(body);

            store.set(key, apiData);
            return oldEnd.apply(res, [chunk, ...args]);
        };

        next();
    }
};

module.exports = cache;
