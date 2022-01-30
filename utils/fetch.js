const axios = require('axios');

/**
 * Used for network calls
 *
 * @param url {String} - API Endpoint URL
 * @param [method = 'get'] {String} - API Call Method (GET, POST etc.) - optional
 * @param [params = null] {Object} - Query Params for the API call - optional
 * @param [data = null] {Object} - Body to be sent - optional
 * @param [headers = null] {Object} - Headers to be sent - optional
 * @param [options = null] {Object} - Options to be sent via axios - optional
 */

const fetch = async (url, method = 'get', params = null, data = null, headers = null, options = null) => {
  try {
    const response = await axios({
      method,
      url,
      params,
      data,
      headers,
      ...options,
    });
    return response;
  } catch (err) {
    logger.error('Something went wrong. Please contact admin', err);
    throw err;
  }
};

module.exports = {
  fetch,
};
