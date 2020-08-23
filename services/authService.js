const jwt = require('jsonwebtoken')
const config = require('config')

const generateAuthToken = (payload) => {
  return jwt.sign(payload, config.get('userToken.privateKey'), { algorithm: 'RS256', expiresIn: 30 * 24 * 60 * 60 }) // 30 days expiry
}

const verifyAuthToken = (token) => {
  return jwt.verify(token, config.get('userToken.publicKey'), { algorithms: ['RS256'] })
}

module.exports = {
  generateAuthToken,
  verifyAuthToken
}
