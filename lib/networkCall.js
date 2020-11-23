const fetch = require('node-fetch')

const networkCall = async (url, method = 'get', body = null, headers = null) => {
  try {
    const response = await fetch(url, {
      method: method,
      body: body,
      headers: headers
    })
    const json = await response.json()
    return json
  } catch (err) {
    return err
  }
}

module.exports = networkCall
