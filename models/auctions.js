const firestore = require('../utils/firestore')
const auctionsModel = firestore.collection('auctions')
const bidsModel = firestore.collection('bids')
const usersUtils = require('../utils/users')

/**
 * Fetches auction details by auctionId
 *
 * @param auctionsId { String }: Id for the auction to be fetched
 * @return {Promise<{AuctionData|Object}>}
 */
const fetchAuctionById = async (auctionId) => {
  try {
    const auctionRef = await auctionsModel.doc(auctionId).get()
    if (!auctionRef.data()) {
      return false
    }
    const auctionMetadata = auctionRef.data()
    const biddersAndBidsRef = await bidsModel.where('auction_id', '==', auctionId).get()
    const biddersAndBidsArray = []
    biddersAndBidsRef.forEach((bidData) => {
      biddersAndBidsArray.push(bidData.data())
    })
    const promises = biddersAndBidsArray.map(async (bidData) => {
      const bidderUsername = await usersUtils.getUsername(bidData.bidder)
      return { ...bidData, bidder: bidderUsername }
    })
    const biddersAndBids = await Promise.all(promises)

    const seller = usersUtils.getUsername(auctionMetadata.seller)
    const highestBidder = usersUtils.getUsername(auctionMetadata.highest_bidder)
    const promise = await Promise.all([seller, highestBidder])
    const [sellerUsername, highestBidderUsername] = promise

    return { ...auctionMetadata, bidders_and_bids: biddersAndBids, seller: sellerUsername, highest_bidder: highestBidderUsername }
  } catch (error) {
    logger.error(`Error fetching auction ${auctionId}: ${error}`)
    throw error
  }
}

/**
 * Fetches auction bidders usernames for a given auction
 *
 * @param auctionsId { String }: Id for the auction
 * @return {Promise<{BiddersUsernames|Array}>}
 */
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

/**
 * Fetches all active (ongoing) auctions
 *
 * @return {Promise<{AuctionData|Array}>}
 */
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

/**
 * Creates new auction
 *
 * @param { Object }: Details required to create an auction
 * @return id {string}
 */
const createNewAuction = async ({ seller, initialPrice, endTime, itemType, quantity }) => {
  try {
    const auctionRef = await auctionsModel.add({
      seller: seller,
      item: itemType,
      quantity: parseInt(quantity),
      highest_bidder: null,
      highest_bid: parseInt(initialPrice),
      start_time: new Date().getTime(),
      end_time: parseInt(endTime)
    })

    return auctionRef.id
  } catch (error) {
    logger.error(`Error creating new auction: ${error}`)
    throw error
  }
}

/**
 * Makes new bid for a given auction
 *
 * @param { Object }: Data required for placing a bid
 * @return id { string }
 */
const makeNewBid = async ({ bidder, auctionId, bid }) => {
  try {
    const auctionRef = await auctionsModel.doc(auctionId)
    const auctionDataRef = await auctionRef.get()

    if (!auctionDataRef.data()) return { auctionNotFound: true }

    const { highest_bid: highestBid } = await auctionDataRef.data()
    if (parseInt(bid) <= parseInt(highestBid)) {
      return { notAllowed: true }
    }

    await auctionRef.update({
      highest_bidder: bidder,
      highest_bid: parseInt(bid)
    })

    const bidRef = await bidsModel.add({
      auction_id: auctionId,
      bidder: bidder,
      bid: parseInt(bid),
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
  fetchAvailableAuctions,
  fetchAuctionBidders,
  createNewAuction,
  makeNewBid
}
