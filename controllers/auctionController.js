const auctions = require('../models/auctions')

const fetchAvailableAuctions = async (_req, res) => {
  try {
    const availableAuctions = await auctions.fetchAvailableAuctions()
    return res.json(availableAuctions)
  } catch (error) {
    logger.error(`Error fetching available auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const fetchAuctionById = async (req, res) => {
  try {
    const auctionId = req.params.id
    const auctionData = await auctions.fetchAuctionById(auctionId)
    return res.json(auctionData)
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const fetchAuctionBySeller = async (req, res) => {
  try {
    const sellerId = req.params.id
    const auctionsBySeller = await auctions.fetchAuctionBySeller(sellerId)
    return res.json(auctionsBySeller)
  } catch (error) {
    logger.error(`Error fetching auctions by seller: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const createNewAuction = async (req, res) => {
  try {
    const { username: seller } = req.userData
    const { initial_price: initialPrice, item_type: itemType, end_time: endTime, quantity } = req.body
    const auctionId = await auctions.createNewAuction({ seller, initialPrice, itemType, endTime, quantity })
    return res.json({ id: auctionId, message: 'Auction created successfully!' })
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const makeNewBid = async (req, res) => {
  try {
    const { username: bidder } = req.userData
    const auctionId = req.params.id
    const { bid } = req.body
    const bidId = await auctions.makeNewBid({ auctionId, bidder, bid })
    if (!bidId) return res.json({ message: 'Your bid was not higher than current one!' })

    return res.json({ id: bidId, message: 'Successfully placed bid!' })
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

module.exports = {
  fetchAuctionById,
  fetchAuctionBySeller,
  fetchAvailableAuctions,
  createNewAuction,
  makeNewBid
}
