const firestore = require('../utils/firestore')
const auctionsModel = firestore.collection('auctions')
const bidsModel = firestore.collection('bids')
const usersUtils = require('../utils/users')

const fetchAuctionById = async (auctionId) => {
  try {
    const auctionRef = await auctionsModel.doc(auctionId).get()
    const auctionMetadata = auctionRef.data()
    const biddersAndBidsRef = await bidsModel.where('auction_id', '==', auctionId).get()
    const biddersAndBids = []
    biddersAndBidsRef.forEach((bidData) => {
      biddersAndBids.push(bidData.data())
    })
    const promises = biddersAndBids.map(async (bidData) => {
      const bidderUsername = await usersUtils.getUsername(bidData.bidder)
      return { ...bidData, bidder: bidderUsername }
    })
    const bidders = await Promise.all(promises)

    const seller = usersUtils.getUsername(auctionMetadata.seller)
    const highestBidder = usersUtils.getUsername(auctionMetadata.highest_bidder)
    const promise = await Promise.all([seller, highestBidder])
    const [sellerUsername, highestBidderUsername] = promise

    return { ...auctionMetadata, bidders, seller: sellerUsername, highest_bidder: highestBidderUsername }
  } catch (error) {
    logger.error(`Error fetching auction ${auctionId}: ${error}`)
    throw error
  }
}

const fetchAuctionBidders = async (auctionId) => {
  try {
    const biddersRef = await bidsModel.where('auction_id', '==', auctionId).get()
    const biddersSet = new Set([])
    biddersRef.forEach((bid) => {
      const { bidder } = bid.data()
      biddersSet.add(bidder)
    })
    const biddersArray = [...biddersSet]
    const promises = biddersArray.map(async (bidder) => {
      const bidderUsername = await usersUtils.getUsername(bidder)
      return bidderUsername
    })
    const bidders = await Promise.all(promises)
    return bidders
  } catch (error) {
    logger.error(`Error fetching bidders: ${error}`)
    throw error
  }
}

const fetchAuctionBySeller = async (seller) => {
  try {
    const sellerId = await usersUtils.getUserId(seller)
    const auctionsRef = await auctionsModel.where('seller', '==', sellerId).get()
    const auctionsArray = []

    auctionsRef.forEach((auction) => {
      auctionsArray.push({
        id: auction.id,
        ...auction.data()
      })
    })

    const promises = auctionsArray.map(async (auction) => {
      const seller = usersUtils.getUsername(auction.seller)
      const highestBidder = usersUtils.getUsername(auction.highest_bidder)
      const promise = await Promise.all([seller, highestBidder])
      const [sellerUsername, highestBidderUsername] = promise
      return { ...auction, seller: sellerUsername, highest_bidder: highestBidderUsername }
    })
    const auctions = await Promise.all(promises)
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
        const seller = usersUtils.getUsername(auction.seller)
        const highestBidder = usersUtils.getUsername(auction.highest_bidder)
        const biddersArray = fetchAuctionBidders(auction.id)
        const promise = await Promise.all([seller, highestBidder, biddersArray])
        const [sellerUsername, highestBidderUsername, bidders] = promise
        return { ...auction, seller: sellerUsername, highest_bidder: highestBidderUsername, bidders }
      } catch (error) {
        logger.error(`Error fetching bidders for auction - ${auction.id}: ${error}`)
        throw error
      }
    })

    const auctionsAndBidders = await Promise.all(promises)
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
