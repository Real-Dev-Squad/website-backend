const jwt = require('jsonwebtoken')
const config = require('config')

/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
const generateAuthToken = (payload) => {
  return jwt.sign(payload, config.get('userToken.privateKey'), {
    algorithm: 'RS256',
    expiresIn: config.get('userToken.ttl')
  })
}

/**
 * Verifies if the JWT is valid. Throws error in case of signature error or expiry
 *
 * @param token {String} - JWT to be verified
 * @return {Object} - Decode value of JWT
 */
const verifyAuthToken = (token) => {
  return jwt.verify(token, config.get('userToken.publicKey'), {
    algorithms: ['RS256']
  })
}

/**
 * Decodes the JWT. This is irrespective of the signature error or expiry
 *
 * @param token {String} - JWT to be decoded
 * @return {Object} - Decode value of JWT
 */
const decodeAuthToken = (token) => {
  return jwt.decode(token)
}

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  decodeAuthToken
}
