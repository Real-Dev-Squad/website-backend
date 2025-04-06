import axios from "axios";
import logger from "./logger.js";

/**
 * Used for network calls
 *
 * @param url {String} - API Endpoint URL
 * @param options {Object} - Options for the API call including method, params, data, headers, etc.
 */
const fetch = async (url, options = {}) => {
  try {
    const response = await axios({
      url,
      ...options,
    });
    return response.data;
  } catch (err) {
    logger.error("Something went wrong. Please contact admin", err);
    throw err;
  }
};

export default {
  fetch,
};
