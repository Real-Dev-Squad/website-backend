const { NEELAM } = require('../../../constants/wallets')

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

const auctionData = {
  itemType: NEELAM,
  quantity: 5,
  initialPrice: 1000,
  endTime: Date.now() + 60 * 60 * 1000
}

module.exports = auctionData
