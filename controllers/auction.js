const auctions = require("../models/auctions");
const wallet = require("../models/wallets");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Fetches all the active (ongoing) auctions
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchAvailableAuctions = async (_req, res) => {
  try {
    const availableAuctions = await auctions.fetchAvailableAuctions();
    return res.json({
      message: "Auctions returned successfully!",
      auctions: availableAuctions,
    });
  } catch (error) {
    logger.error(`Error fetching available auctions: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Fetches auction given the auction id
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchAuctionById = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const auctionData = await auctions.fetchAuctionById(auctionId);
    if (!auctionData) {
      return res.boom.notFound("Auction doesn't exist");
    }
    return res.json(auctionData);
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Creates new auction
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createNewAuction = async (req, res) => {
  try {
    const { id: seller } = req.userData;
    const { initial_price: initialPrice, item_type: itemType, end_time: endTime, quantity } = req.body;

    const { currencies } = await wallet.fetchWallet(seller);
    const itemQuantity = parseInt(currencies[`${itemType}`]);
    if (!itemQuantity || itemQuantity < quantity) return res.boom.forbidden(`You do not have enough of ${itemType}s!`);

    const auctionId = await auctions.createNewAuction({ seller, initialPrice, itemType, endTime, quantity });
    return res.status(201).json({ id: auctionId, message: "Auction created successfully!" });
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Makes new bid on a given auction
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const makeNewBid = async (req, res) => {
  try {
    const { id: bidder } = req.userData;
    const auctionId = req.params.id;
    const { bid } = req.body;
    const newBid = await auctions.makeNewBid({ auctionId, bidder, bid });

    if (newBid.auctionNotFound) return res.boom.notFound("Auction doesn't exist");
    if (newBid.noWallet) return res.boom.forbidden("You do not have a wallet!");
    if (newBid.insufficientMoney) return res.boom.forbidden("You do not have sufficient money");
    if (newBid.lowBid) return res.boom.forbidden("Your bid was not higher than current one!");

    return res.status(201).json({ message: "Successfully placed bid!" });
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  fetchAuctionById,
  fetchAvailableAuctions,
  createNewAuction,
  makeNewBid,
};
