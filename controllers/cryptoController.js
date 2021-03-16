const usersdata = require('../models/crypto')
const calculation = require('../middlewares/cryptoTransactionCalc')
/**
 * Send Money from one User to Other
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * {
 *  "to": "kratika",
 *  "from": "uttam",
 *  "amount": 25,
 *  "currency": "dinero"
 * }
 */
const send = async (req, res) => {
  try {
    const request = req.body
    const [userTo, userFrom, currencyType, amount] = [request.to, request.from, request.currency, request.amount]
    const message1 = `${amount} ${currencyType} Coins Creditted From ${userFrom} to ${userTo} Succesfully`
    const fromUserWallet = await usersdata.fetchUserWallet(userFrom)
    if (fromUserWallet.user.currency[`${currencyType}`] < amount) {
      return res.json({
        message: 'Amount of Currency need to be transfered is higher than your balance',
        status: 404
      })
    }
    const toUserWallet = await usersdata.fetchUserWallet(userTo)
    const resultObj = calculation.cryptoCalc(fromUserWallet, toUserWallet, currencyType, amount)
    await Promise.all([usersdata.updateWallet(resultObj.fromUserWallet), usersdata.updateWallet(resultObj.toUserWallet), usersdata.updateTransaction(message1)])
    return res.json({
      message: message1,
      status: 200
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
 * {
 *  "to": "kratika",
 *  "from": "uttam",
 *  "amount": 25,
 *  "currency": "dinero"
 * }
 */
const request = async (req, res) => {
  try {
    const request = req.body
    const [userTo, userFrom, currencyType, amount] = [request.to, request.from, request.currency, request.amount]
    const notificationMessage = `${amount} ${currencyType} Coins Requested By ${userFrom}`
    const toUserWallet = await usersdata.fetchUserWallet(userTo)
    if (toUserWallet.user.currency[`${currencyType}`] < amount) {
      return res.json({
        message: 'Please request from someother person as Balance is low',
        status: 404
      })
    }
    const fromUserWallet = await usersdata.fetchUserWallet(userFrom)
    if (fromUserWallet && toUserWallet) {
      await usersdata.notification(notificationMessage, userTo)
    }
    return res.json({
      message: notificationMessage,
      status: 200
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
    const verifyUserTo = await usersdata.fetchUserWallet(userTO)
    const message1 = `${amount} ${currency} Coins Transfered From ${userFrom} to ${userTO}`
    const resultObj = calculation.cryptoCalc(verifyUserFrom, verifyUserTo, currency, amount)
    await Promise.all([usersdata.updateWallet(resultObj.fromUserWallet), usersdata.updateWallet(resultObj.toUserWallet), usersdata.updateTransaction(message1)])
    return res.json({
      message: message1,
      status: 200
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
