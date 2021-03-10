const auctions = require('../models/auctions')

const fetchOngoingAuctions = async (_req, res) => {
  try {
    // const ongoingAuctions = auctions.fetchAvailableAuctions();
    const ongoingAuctions = await auctions.fetchAuctionById('Mgu5rEvVwVyhTSNrrl9h')
    logger.info(ongoingAuctions)
    return res.json(ongoingAuctions)
    // return res.json({ ...ongoingAuctions });
  } catch (error) {
    logger.error(`Error fetching ongoing auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const createNewAuction = async (req, res) => {
  try {
    const auctionData = req.body
    const auctionRef = auctions.createNewAuction(auctionData)
    return res.status(200).send(auctionRef.id)
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

const makeNewBid = async (req, res) => {
  try {
    const bidData = req.body
    const bidRef = await auctions.makeNewBid(bidData)
    return res.status(200).send(bidRef.id)
  } catch (error) {
    logger.error(`Error creating new auctions: ${error}`)
    return res.boom.badImplementation('An internal server error occured.')
  }
}

module.exports = {
  fetchOngoingAuctions,
  createNewAuction,
  makeNewBid
}
