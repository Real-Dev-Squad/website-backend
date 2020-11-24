const axios = require('axios')
const logger = require('../utils/logger')

const networkCall = async (url, queryParams, method = 'get', body = null, headers = null) => {
  try {
    const response = await axios({
      method: method,
      url: url,
      params: queryParams,
      data: body,
      headers: headers
    })
    return response
  } catch (err) {
    logger.error('Something went wrong. Please contact admin')
    throw err
  }
}

module.exports = networkCall
