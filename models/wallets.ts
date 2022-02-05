// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { INITIAL_WALLET } = require('../constants/wallets')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
const walletModel = firestore.collection('wallets')

/**
 * Fetches the data from user wallet
 * @return {Promise<walletModel|object>}
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchWalle... Remove this comment to see the full error message
const fetchWallet = async (userId: any) => {
  try {
    const walletDocs = await walletModel.where('userId', '==', userId).limit(1).get()
    const [userWallet] = walletDocs.docs
    if (userWallet) {
      return { id: userWallet.id, ...userWallet.data() }
    }
    return null
  } catch (err) {
    logger.error('Error retrieving wallets', err)
    throw err
  }
}

/**
 * Create new wallet for user
 * @return {Promise<walletModel|object>}
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createWall... Remove this comment to see the full error message
const createWallet = async (userId: any, currencies = {}) => {
  try {
    const walletData = {
      userId,
      isActive: true,
      currencies
    }
    const { id } = await walletModel.add(walletData)
    return {
      id,
      data: walletData
    }
  } catch (err) {
    logger.error('Error creating user wallet', err)
    throw err
  }
}

/**
 * Update wallet for user
 * @return {Promise<walletModel|object>}
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'updateWall... Remove this comment to see the full error message
const updateWallet = async (userId: any, currencies: any) => {
  try {
    let userWallet = await fetchWallet(userId)
    if (!userWallet) {
      userWallet = await createWallet(userId, INITIAL_WALLET)
    }
    const firestoreKeysObject = {}
    for (const key in currencies) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      firestoreKeysObject[`currencies.${key}`] = currencies[`${key}`]
    }
    const walletRef = walletModel.doc(userWallet.id)
    const res = await walletRef.update({
      ...firestoreKeysObject
    })
    if (res) {
      return true
    }
    return false
  } catch (err) {
    logger.error('Error updating currency to user wallets', err)
    throw err
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  fetchWallet,
  updateWallet,
  createWallet
}
