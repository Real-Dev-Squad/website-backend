const { NEELAM } = require('../../../constants/wallets')

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
  end_time: Date.now() + 60 * 60 * 1000
}

module.exports = auctionData
