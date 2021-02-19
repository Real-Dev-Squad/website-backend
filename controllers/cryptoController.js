const usersdata = require('../models/crypto')
/**
 * Send Money from one User to Other
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
// http://localhost:3000/cryptoTransaction/send
// content-type: application.json -> hearder
// JSON body
// {
//   "to": "uttam",
//   "from": "kratika",
//   "amount": 30,
//   "currency": "silver"
// }
const send = async (req, res) => {
  try {
    const request = req.body
    const [userTo, userFrom, currency, amount] = [request.to, request.from, request.currency, request.amount]
    const message1 = `${amount} ${currency} Coins Transfered From ${userFrom} to ${userTo}`
    const verifyUserTO = await usersdata.fetchUser(userTo)
    const verifyUserFrom = await usersdata.fetchUser(userFrom)
    if (verifyUserTO && verifyUserFrom) {
      if (currency === 'brass' && verifyUserFrom.user.coins.brass >= amount) {
        verifyUserFrom.user.coins.brass = verifyUserFrom.user.coins.brass - amount
        verifyUserTO.user.coins.brass = verifyUserTO.user.coins.brass + amount
      } else if (currency === 'gold' && verifyUserFrom.user.coins.gold >= amount) {
        verifyUserFrom.user.coins.gold = verifyUserFrom.user.coins.gold - amount
        verifyUserTO.user.coins.gold = verifyUserTO.user.coins.gold + amount
      } else if (currency === 'silver' && verifyUserFrom.user.coins.silver >= amount) {
        verifyUserFrom.user.coins.silver = verifyUserFrom.user.coins.silver - amount
        verifyUserTO.user.coins.silver = verifyUserTO.user.coins.silver + amount
      }
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
// http://localhost:3000/cryptoTransaction/receive
// content-type: application.json -> hearder
// JSON body
// {
//   "to": "uttam",
//   "from": "kratika",
//   "amount": 30,
//   "currency": "silver"
// }
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

// http://localhost:3000/cryptoTransaction/approvedRequest
// content-type: appliction/json -> header
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
    if (verifyUserTo && verifyUserFrom) {
      if (currency === 'brass' && verifyUserFrom.user.coins.brass >= amount) {
        verifyUserFrom.user.coins.brass = verifyUserFrom.user.coins.brass - amount
        verifyUserTo.user.coins.brass = verifyUserTo.user.coins.brass + parseInt(amount)
      } else if (currency === 'gold' && verifyUserFrom.user.coins.gold >= amount) {
        verifyUserFrom.user.coins.gold = verifyUserFrom.user.coins.gold - amount
        verifyUserTo.user.coins.gold = verifyUserTo.user.coins.gold + parseInt(amount)
      } else if (currency === 'silver' && verifyUserFrom.user.coins.silver >= amount) {
        verifyUserFrom.user.coins.silver = verifyUserFrom.user.coins.silver - amount
        verifyUserTo.user.coins.silver = verifyUserTo.user.coins.silver + parseInt(amount)
      }
    }
    return res.json({
      message: notification,
      from: verifyUserFrom,
      to: verifyUserTo
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
