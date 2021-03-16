const { fetchWallet, createWalletForAllUsers } = require('../models/wallets')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the  wallet details of user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getUserWallet = async (req, res) => {
  try {
    const { id: userId } = req.userData
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

/**
 * Create wallet for all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const createWalletForUsers = async (req, res) => {
  try {
    const { username } = req.userData
    if (username === 'ankush') {
      const walletsStatus = await createWalletForAllUsers()
      return res.json({
        message: 'Create wallet for all users request accepted.',
        status: walletsStatus/*  ? 'success' : 'failure' */
      })
    }
    return res.boom.forbidden('You cannot not create wallets, please contact admin')
  } catch (err) {
    logger.error(`Error while creating wallet's for users ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getUserWallet,
  createWalletForUsers
}
