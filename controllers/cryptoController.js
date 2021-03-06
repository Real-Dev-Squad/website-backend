const usersdata = require('../models/crypto')
const calculation = require('../middlewares/cryptoTransactionClac')
/**
 * Send Money from one User to Other
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const send = async (req, res) => {
  try {
    const request = req.body
    const [userTo, userFrom, currency, amount] = [request.to, request.from, request.currency, request.amount]
    const message1 = `${amount} ${currency} Coins Transfered From ${userFrom} to ${userTo}`
    const verifyUserTO = await usersdata.fetchUser(userTo)
    const verifyUserFrom = await usersdata.fetchUser(userFrom)
    const resultObj = calculation.cryptoCalc(verifyUserTO, verifyUserFrom, currency, amount)
    return res.json({
      message: message1,
      to: resultObj.verifyUserTO,
      from: resultObj.verifyUserFrom
    })
  } catch (error) {
    logger.error(`Error while processing pull requests: ${error}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

/**
 * Receive Money from one User to Other
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const request = async (req, res) => {
  try {
    const request = req.body
    const [userTo, userFrom, currency, amount] = [request.to, request.from, request.currency, request.amount]
    const notificationMessage = `${amount} ${currency} Coins Requested By ${userFrom}`
    const message1 = `${amount} ${currency} Coins Requested By ${userFrom} From ${userTo}`
    const verifyUserTO = await usersdata.fetchUser(userTo)
    const verifyUserFrom = await usersdata.fetchUser(userFrom)
    if (verifyUserFrom && verifyUserTO) {
      const notificationArray = verifyUserTO.user.notification
      notificationArray.push(notificationMessage)
    }
    return res.json({
      message: message1,
      to: verifyUserTO,
      from: verifyUserFrom
    })
  } catch (error) {
    logger.error(`Error while processing pull requests: ${error}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

/**
 * Receive Money from one User to Other
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
// Json Body
//  {
//   "notification":  "30 silver Coins Requested By kratika",
//   "userName": "uttam"
// }
const approved = async (req, res) => {
  try {
    const request = req.body
    const [notification, userFrom] = [request.notification, request.userName]
    const verifyUserFrom = await usersdata.fetchUser(userFrom)
    const message = notification.split(' ')
    const [amount, currency, userTO] = [message[0], message[1], message[(message.length) - 1]]
    const verifyUserTo = await usersdata.fetchUser(userTO)
    // const message1 = `${amount} ${currency} Coins Transfered From ${userFrom} to ${userTo}`;
    const resultObj = calculation.cryptoCalc(verifyUserTo, verifyUserFrom, currency, amount)
    return res.json({
      message: notification,
      to: resultObj.verifyUserTO,
      from: resultObj.verifyUserFrom
    })
  } catch (error) {
    logger.error(`Error while processing pull requests: ${error}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  send,
  request,
  approved
}
