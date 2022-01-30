const { INITIAL_WALLET } = require('../constants/wallets');
const firestore = require('../utils/firestore');
const walletModel = firestore.collection('wallets');

/**
 * Fetches the data from user wallet
 * @return {Promise<walletModel|object>}
 */
const fetchWallet = async (userId) => {
  try {
    const walletDocs = await walletModel.where('userId', '==', userId).limit(1).get();
    const [userWallet] = walletDocs.docs;
    if (userWallet) {
      return { id: userWallet.id, ...userWallet.data() };
    }
    return null;
  } catch (err) {
    logger.error('Error retrieving wallets', err);
    throw err;
  }
};

/**
 * Create new wallet for user
 * @return {Promise<walletModel|object>}
 */
const createWallet = async (userId, currencies = {}) => {
  try {
    const walletData = {
      userId,
      isActive: true,
      currencies,
    };
    const { id } = await walletModel.add(walletData);
    return {
      id,
      data: walletData,
    };
  } catch (err) {
    logger.error('Error creating user wallet', err);
    throw err;
  }
};

/**
 * Update wallet for user
 * @return {Promise<walletModel|object>}
 */
const updateWallet = async (userId, currencies) => {
  try {
    let userWallet = await fetchWallet(userId);
    if (!userWallet) {
      userWallet = await createWallet(userId, INITIAL_WALLET);
    }
    const firestoreKeysObject = {};
    for (const key in currencies) {
      firestoreKeysObject[`currencies.${key}`] = currencies[`${key}`];
    }
    const walletRef = walletModel.doc(userWallet.id);
    const res = await walletRef.update({
      ...firestoreKeysObject,
    });
    if (res) {
      return true;
    }
    return false;
  } catch (err) {
    logger.error('Error updating currency to user wallets', err);
    throw err;
  }
};

module.exports = {
  fetchWallet,
  updateWallet,
  createWallet,
};
