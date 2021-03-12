const firestore = require('../utils/firestore')
const auctionsModel = firestore.collection('auctions')
const bidsModel = firestore.collection('bids')

const fetchAuctionById = async (auctionId) => {
  try {
    const auctionRef = await auctionsModel.doc(auctionId).get()
    const auctionMetadata = auctionRef.data()
    const biddersAndBidsRef = await bidsModel.where('auction_id', '==', auctionId).get()
    const biddersAndBids = []
    biddersAndBidsRef.forEach((bidData) => {
      biddersAndBids.push(bidData.data())
    })
    return { ...auctionMetadata, biddersAndBids }
  } catch (error) {
    logger.error(`Error fetching auction ${auctionId}: ${error}`)
    throw error
  }
}

const fetchAuctionBidders = async (auctionId) => {
  try {
    const biddersRef = await bidsModel.where('auction_id', '==', auctionId).get()
    const bidders = new Set([])
    biddersRef.forEach((bid) => {
      const { bidder } = bid.data()
      bidders.add(bidder)
    })
    return [...bidders]
  } catch (error) {
    logger.error(`Error fetching bidders: ${error}`)
    throw error
  }
}

const fetchAuctionBySeller = async (sellerId) => {
  try {
    const auctionsRef = await auctionsModel.where('seller', '==', sellerId).get()
    const auctions = []

    auctionsRef.forEach((auction) => {
      auctions.push({
        id: auction.id,
        ...auction.data()
      })
    })

    return auctions
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    throw error
  }
}

const fetchAvailableAuctions = async () => {
  try {
    const now = new Date().getTime()
    const auctionsRef = await auctionsModel.where('end_time', '>=', now).get()
    const auctions = []

    auctionsRef.forEach((auction) => {
      auctions.push({
        id: auction.id,
        ...auction.data()
      })
    })

    const promises = auctions.map(async (auction) => {
      try {
        const bidders = await fetchAuctionBidders(auction.id)
        return {
          bidders: bidders,
          ...auction
        }
      } catch (error) {
        logger.error(`Error fetching bidders for auction - ${auction.id}: ${error}`)
        throw error
      }
    })

    const auctionsAndBidders = Promise.all(promises)

    return auctionsAndBidders
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    throw error
  }
}

const fetchAuctionsInRange = async (startTime, endTime = null) => {
  let auctionsRef
  try {
    if (endTime) {
      auctionsRef = await auctionsModel.where('startTime', '>=', startTime).where('endTime', '<=', endTime).get()
    } else {
      auctionsRef = await auctionsModel.where('startTime', '>=', startTime).get()
    }
    const auctions = []
    auctionsRef.forEach((auction) => {
      auctions.push({
        id: auction.id,
        ...auction.data
      })
    })
    return auctions
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    throw error
  }
}

const createNewAuction = async ({ seller, initialPrice, endTime, itemType, quantity }) => {
  try {
    const auctionRef = await auctionsModel.add({
      seller: seller,
      item: itemType,
      quantity: quantity,
      highest_bidder: null,
      highest_bid: initialPrice,
      number_bidders: 0,
      start_time: new Date().getTime(),
      end_time: Number(endTime)
    })

    return auctionRef.id
  } catch (error) {
    logger.error(`Error creating new auction: ${error}`)
    throw error
  }
}

const makeNewBid = async ({ bidder, auctionId, bid }) => {
  try {
    const auctionRef = await auctionsModel.doc(auctionId)
    const auctionDataRef = await auctionRef.get()

    const { highest_bid: highestBid } = await auctionDataRef.data()
    if (parseInt(bid) <= parseInt(highestBid)) {
      return ''
    }

    await auctionRef.update({
      highest_bidder: bidder,
      highest_bid: bid
    })

    const bidRef = await bidsModel.add({
      auction_id: auctionId,
      bidder: bidder,
      bid: bid,
      time: new Date().getTime()
    })

    return bidRef.id
  } catch (error) {
    logger.error(`Error making bid: ${error}`)
    throw error
  }
}

module.exports = {
  fetchAuctionById,
  fetchAuctionBySeller,
  fetchAvailableAuctions,
  fetchAuctionBidders,
  fetchAuctionsInRange,
  createNewAuction,
  makeNewBid
}
