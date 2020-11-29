const axios = require('axios')
const logger = require('./logger')

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
      ...options
    })
    return response
  } catch (err) {
    logger.error('Something went wrong. Please contact admin', err)
    throw err
  }
}

/**
 * Loops over an array of objects, takes a value corresponding to key provided and saves it in an array
 *
 * @param arrayOfObjects {Array} - Array of objects to loop over
 * @param key {String} - Value corresponding to this key is saved
 */

const getNames = (arrayOfObjects, key) => {
  const names = []
  arrayOfObjects.forEach((object) => {
    names.push(object[key])
  })
  return names
}

module.exports = {
  fetch,
  getNames
}
