const firestore = require('../utils/firestore')
const walletModel = firestore.collection('wallet')

/**
 * Fetches the data from user wallet
 * @return {Promise<walletModel|object>}
 */
const fetchWallet = async (userId) => {
  try {
    const walletDocs = await walletModel.where('userId', '==', userId).limit(1).get()
    if ((!walletDocs.empty) && walletDocs.docs[0]) {
      return { id: walletDocs.docs[0].id, ...walletDocs.docs[0].data() }
    }
    return {}
  } catch (err) {
    logger.error('Error retrieving wallets', err)
    return err
  }
}

/**
 * Create new wallet for user
 * @return {Promise<walletModel|object>}
 */
const createWallet = async (userId) => {
  try {
    const walletData = {
      userId,
      isActive: true,
      currency: {}
    }
    const wallet = await walletModel.add(walletData)
    return {
      id: wallet.id,
      data: walletData
    }
  } catch (err) {
    logger.error('Error creating user wallet', err)
    return err
  }
}

/**
 * Update currecny wallet for user
 * @return {Promise<walletModel|object>}
 */
const updateWallet = async (userId, currency) => {
  try {
    let userWallet = await fetchWallet(userId)
    if (!userWallet.id) {
      await createWallet(userId)
      userWallet = await fetchWallet(userId)
    }
    const newCurrencyValues = {}
    for (const key in currency) {
      newCurrencyValues[`currency.${key}`] = currency[key]
    }
    const walletRef = walletModel.doc(userWallet.id)
    await walletRef.update({
      ...newCurrencyValues
    })
    const updatedWallet = await fetchWallet(userId)
    return updatedWallet
  } catch (err) {
    logger.error('Error updating currency to user wallets', err)
    return err
  }
}

module.exports = {
  fetchWallet,
  updateWallet
}
