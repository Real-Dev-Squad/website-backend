const usersdata = require('../models/crypto')
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
    const result = await Promise.all([usersdata.updateWallet({ fromUserWallet, toUserWallet, currencyType, amount })])
    if (result[0].message === 'success') {
      await usersdata.updateTransaction(message1)
    }
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
      await usersdata.notification(notificationMessage, userTo, 'Credit Request')
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
//   "notification":  "30 dinero Coins Requested By kratika",
//   "userName": "uttam"
// }
const approved = async (req, res) => {
  try {
    const request = req.body
    const [notification, userFrom] = [request.notification, request.userName]
    const fromUserWallet = await usersdata.fetchUserWallet(userFrom)
    const message = notification.split(' ')
    const [amount, currencyType, userTO] = [message[0], message[1], message[(message.length) - 1]]
    const toUserWallet = await usersdata.fetchUserWallet(userTO)
    const message1 = `${amount} ${currencyType} Coins Transfered From ${userFrom} to ${userTO}`
    const result = await Promise.all([usersdata.updateWallet({ fromUserWallet, toUserWallet, currencyType, amount })])
    if (result[0].message === 'success') {
      await usersdata.updateTransaction(message1)
    }
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
 */
// Json Body
//  {
//   "notification":  "30 dinero Coins Requested By kratika is declined",
//   "userName": "uttam"
// }
const decline = async (req, res) => {
  try {
    const request = req.body
    const [notification, userFrom] = [request.notification, request.userName]
    const message = notification.split(' ')
    const notificationMessage = notification + ` by ${userFrom}`
    const userTO = message[5]
    await usersdata.notification(notificationMessage, userTO, 'Credit Request Declined')
    return res.json({
      message: notification,
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
  approved,
  decline
}
