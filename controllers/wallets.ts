// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchWalle... Remove this comment to see the full error message
const { fetchWallet, createWallet } = require('../models/wallets')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userUtils'... Remove this comment to see the full error message
const userUtils = require('../utils/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'walletCons... Remove this comment to see the full error message
const walletConstants = require('../constants/wallets')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ERROR_MESS... Remove this comment to see the full error message
const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the wallet for userId, or create default one for
 * existing members
 * @param {string} userId
 */
const getWallet = async (userId: any) => {
  try {
    let wallet = await fetchWallet(userId)

    if (!wallet) {
      // #TODO Log which users didn't have a wallet
      wallet = await createWallet(userId, walletConstants.INITIAL_WALLET)
      logger.info('Created new wallet for user')
    }
    return wallet
  } catch (err) {
    logger.error(`Error in getWallet ${err}`)
    return null
  }
}

/**
 * Get the wallet details of user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOwnWallet = async (req: any, res: any) => {
  const { id: userId } = req.userData

  try {
    const wallet = await getWallet(userId)

    return res.json({
      message: 'Wallet returned successfully for user',
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
const getUserWallet = async (req: any, res: any) => {
  // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
  const { params: { username } = {} } = req
  const userId = await userUtils.getUserId(username)

  try {
    const wallet = await getWallet(userId)

    return res.json({
      message: 'Wallet returned successfully',
      wallet
    })
  } catch (err) {
    logger.error(`Error while retriving wallet data ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  getOwnWallet,
  getUserWallet
}
