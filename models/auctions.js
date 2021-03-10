const firestore = require('../utils/firestore')
const auctionsModel = firestore.collection('auctions')
const biddingLogModel = firestore.collection('biddingLog')

const fetchAuctionById = async (auctionId) => {
  try {
    const auctionRef = await auctionsModel.doc(auctionId).get()
    const auctionData = auctionRef.data()
    return auctionData
  } catch (error) {
    logger.error(`Error fetching auction ${auctionId}: ${error}`)
    return {}
  }
}

const fetchAuctionBySeller = async (sellerUserId) => {
  try {
    const auctionRef = await auctionsModel.doc('Mgu5rEvVwVyhTSNrrl9h').get()
    const auctionData = auctionRef.data()
    return auctionData
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    return {}
  }
}

const fetchAvailableAuctions = async () => {
  try {
    const auctionRef = await auctionsModel.doc('Mgu5rEvVwVyhTSNrrl9h').get()
    const auctionData = auctionRef.data()
    return auctionData
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    return {}
  }
}

const fetchAuctionsInRange = async (startDate, endDate = null) => {
  try {
    const auctionRef = await auctionsModel.doc('Mgu5rEvVwVyhTSNrrl9h').get()
    const auctionData = auctionRef.data()
    return auctionData
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    return {}
  }
}

const createNewAuction = async ({ sellerUserId, initialPrice, itemType, duration }) => {
  try {
    const now = new Date().getTime()

    const auctionRef = await auctionsModel.add({
      seller: sellerUserId,
      item: itemType,
      highest_bidder: null,
      highest_bid: initialPrice,
      startTime: now,
      endTime: now + duration
    })

    logger.info(`Created new auction ${auctionRef.id}`)
    return auctionRef
  } catch (error) {
    logger.error(`Error creating new auction: ${error}`)
    return {}
  }
}

const makeNewBid = async (userId, auctionId, bid) => {
  try {
    const bidRef = await biddingLogModel.add({
      auctionId: auctionId,
      bidderId: userId,
      bid: bid,
      time: new Date().now()
    })

    logger.info(`Made new bid ${bidRef.id}`)
    return bidRef
  } catch (error) {
    logger.error(`Error making bid: ${error}`)
    return {}
  }
}

module.exports = {
  fetchAuctionById,
  fetchAuctionBySeller,
  fetchAvailableAuctions,
  fetchAuctionsInRange,

  createNewAuction,

  makeNewBid
}
