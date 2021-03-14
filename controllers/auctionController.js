const auctions = require('../models/auctions')

/**
 * Fetches all the active (ongoing) auctions
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchAvailableAuctions = async (_req, res) => {
  try {
    const availableAuctions = await auctions.fetchAvailableAuctions()
    return res.json({
      message: 'Auctions returned successfully!',
      auctions: availableAuctions
    })
  } catch (error) {
    logger.error(`Error fetching available auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

/**
 * Fetches auction given the auction id
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchAuctionById = async (req, res) => {
  try {
    const auctionId = req.params.id
    const auctionData = await auctions.fetchAuctionById(auctionId)
    if (!auctionData) {
      return res.boom.notFound('Auction doesn\'t exist')
    }
    return res.json(auctionData)
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

/**
 * Creates new auction
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createNewAuction = async (req, res) => {
  try {
    const { id: seller } = req.userData
    const { initial_price: initialPrice, item_type: itemType, end_time: endTime, quantity } = req.body
    const auctionId = await auctions.createNewAuction({ seller, initialPrice, itemType, endTime, quantity })
    return res.status(204).json({ id: auctionId, message: 'Auction created successfully!' })
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

/**
 * Makes new bid on a given auction
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const makeNewBid = async (req, res) => {
  try {
    const { id: bidder } = req.userData
    const auctionId = req.params.id
    const { bid } = req.body
    const newBid = await auctions.makeNewBid({ auctionId, bidder, bid })
    if (newBid.auctionNotFound) return res.boom.notFound('Auction doesn\'t exist')
    if (newBid.notAllowed) return res.boom.forbidden('Your bid was not higher than current one!')

    return res.status(204).json({ id: newBid, message: 'Successfully placed bid!' })
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

module.exports = {
  fetchAuctionById,
  fetchAvailableAuctions,
  createNewAuction,
  makeNewBid
}
