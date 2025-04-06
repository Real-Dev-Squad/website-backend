import { fetchWallet, createWallet } from "../models/wallets.js";
import userUtils from "../utils/users.js";
import walletConstants from "../constants/wallets.js";
import { SOMETHING_WENT_WRONG } from "../constants/errorMessages.js";

/**
 * Get the wallet for userId, or create default one for
 * existing members
 * @param {string} userId
 */
const getWallet = async (userId) => {
  try {
    let wallet = await fetchWallet(userId);

    if (!wallet) {
      // #TODO Log which users didn't have a wallet
      wallet = await createWallet(userId, walletConstants.INITIAL_WALLET);
      logger.info("Created new wallet for user");
    }
    return wallet;
  } catch (err) {
    logger.error(`Error in getWallet ${err}`);
    return null;
  }
};

/**
 * Get the wallet details of user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOwnWallet = async (req, res) => {
  const { id: userId } = req.userData;

  try {
    const wallet = await getWallet(userId);

    return res.json({
      message: "Wallet returned successfully for user",
      wallet,
    });
  } catch (err) {
    logger.error(`Error while retriving wallet data ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

/**
 * Get the wallet details of user, if a username is provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserWallet = async (req, res) => {
  const { params: { username } = {} } = req;
  const userId = await userUtils.getUserId(username);

  try {
    const wallet = await getWallet(userId);

    return res.json({
      message: "Wallet returned successfully",
      wallet,
    });
  } catch (err) {
    logger.error(`Error while retriving wallet data ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

export default {
  getOwnWallet,
  getUserWallet,
};
