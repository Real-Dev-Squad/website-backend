// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const axios = require('axios')

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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetch'.
const fetch = async (url: any, method = 'get', params = null, data = null, headers = null, options = null) => {
  try {
    const response = await axios({
      method,
      url,
      params,
      data,
      headers,
      // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
      ...options
    })
    return response
  } catch (err) {
    logger.error('Something went wrong. Please contact admin', err)
    throw err
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  fetch
}
