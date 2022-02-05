// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'jwt'.
const jwt = require('jsonwebtoken')
/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
const generateAuthToken = (payload: any) => {
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
const verifyAuthToken = (token: any) => {
  return jwt.verify(token, config.get('userToken.publicKey'), { algorithms: ['RS256'] })
}

/**
 * Decodes the JWT. This is irrespective of the signature error or expiry
 *
 * @param token {String} - JWT to be decoded
 * @return {Object} - Decode value of JWT
 */
const decodeAuthToken = (token: any) => {
  return jwt.decode(token)
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  generateAuthToken,
  verifyAuthToken,
  decodeAuthToken
}
