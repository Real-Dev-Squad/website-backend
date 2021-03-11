const auctions = require('../models/auctions')

const fetchAvailableAuctions = async (_req, res) => {
  try {
    const ongoingAuctions = await auctions.fetchAvailableAuctions()
    return res.json(ongoingAuctions)
  } catch (error) {
    logger.error(`Error fetching ongoing auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const fetchAuctionById = async (req, res) => {
  try {
    const auctionId = req.params.id
    const auctionData = await auctions.fetchAuctionById(auctionId)
    logger.info(auctionData)
    return res.json(auctionData)
  } catch (error) {
    logger.error(`Error fetching ongoing auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const fetchAuctionBySeller = async (req, res) => {
  try {
    const sellerId = req.params.id
    const auctionsBySeller = await auctions.fetchAuctionBySeller(sellerId)
    logger.info(auctionsBySeller)
    return res.json(auctionsBySeller)
  } catch (error) {
    logger.error(`Error fetching ongoing auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const createNewAuction = async (req, res) => {
  try {
    const { username: seller } = req.userData
    const { initialPrice, item, duration, quantity } = req.body
    const auctionId = await auctions.createNewAuction({ seller, initialPrice, item, duration, quantity })
    return res.json({ id: auctionId, message: 'Auction created successfully!' })
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const makeNewBid = async (req, res) => {
  try {
    const { username: bidderId } = req.userData
    const auctionId = req.params.id
    const { bid } = req.body
    const bidRef = await auctions.makeNewBid({ auctionId, bidderId, bid })
    return res.json({ id: bidRef, message: 'Successfully placed bid!' })
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
