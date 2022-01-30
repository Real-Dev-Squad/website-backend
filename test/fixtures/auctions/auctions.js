const { NEELAM } = require('../../../constants/wallets');

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

const auctionData = {
  item_type: NEELAM,
  quantity: 2,
  initial_price: 100,
  end_time: Date.now() + 60 * 60 * 1000,
};

const auctionKeys = ['auctions', 'message'];

const auctionWithIdKeys = ['bidders_and_bids', 'end_time', 'highest_bid', 'item', 'quantity', 'seller', 'start_time'];

module.exports = { auctionData, auctionKeys, auctionWithIdKeys };
