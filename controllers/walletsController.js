const { fetchWallet, createWallet } = require('../models/wallets')
const userUtils = require('../utils/users')
const walletConstants = require('../constants/wallets')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the wallet details of user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getUserWallet = async (req, res) => {
  try {
    const { id: userId } = req.userData

    let wallet = await fetchWallet(userId)

    if (!wallet) {
      // #TODO Log which users didn't have a wallet
      wallet = await createWallet(userId, walletConstants.INITIAL_WALLET)
    }
    return res.json({
      message: 'Wallet returned successfully',
      wallet
    })
  } catch (err) {
    logger.error(`Error while retriving wallet data ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

/**
 * Get the wallet details of user, if a username is provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWallet = async (req, res) => {
  try {
    const { params: { username } = {} } = req
    const userId = await userUtils.getUserId(username)

    const walletData = await fetchWallet(userId)
    return res.json({
      message: 'Wallet returned successfully',
      wallet: walletData
    })
  } catch (err) {
    logger.error(`Error while retriving wallet data ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getUserWallet,
  getWallet
}
