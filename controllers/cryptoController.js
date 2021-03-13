const usersdata = require('../models/crypto')
const calculation = require('../middlewares/cryptoTransactionCalc')
/**
 * Send Money from one User to Other
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const send = async (req, res) => {
  try {
    const request = req.body
    const [userTo, userFrom, currency, amount] = [request.to, request.from, request.currency, request.amount]
    const message1 = `${amount} ${currency} Coins Creditted From ${userFrom} to ${userTo} Succesfully`
    const [fromUserWallet, toUserWallet] = await Promise.all([usersdata.fetchUserWallet(userTo), usersdata.fetchUserWallet(userFrom)])
    const resultObj = calculation.cryptoCalc(fromUserWallet, toUserWallet, currency, amount)
    await Promise.all([usersdata.updateWallet(resultObj.fromUserWallet), usersdata.updateWallet(resultObj.toUserWallet), usersdata.updateTransaction(message1)])
    return res.json({
      message: message1
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
    const [verifyUserTO, verifyUserFrom] = await Promise.all([usersdata.fetchUserWallet(userTo), usersdata.fetchUserWallet(userFrom)])
    if (verifyUserFrom && verifyUserTO) {
      await usersdata.notification(notificationMessage, userTo)
    }
    return res.json({
      message: notificationMessage
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
    const verifyUserFrom = await usersdata.fetchUserWallet(userFrom)
    const message = notification.split(' ')
    const [amount, currency, userTO] = [message[0], message[1], message[(message.length) - 1]]
    const verifyUserTo = await usersdata.fetchUser(userTO)
    const message1 = `${amount} ${currency} Coins Transfered From ${userFrom} to ${userTO}`
    const resultObj = calculation.cryptoCalc(verifyUserTo, verifyUserFrom, currency, amount)
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

module.exports = {
  send,
  request,
  approved
}
