// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'NEELAM'.
const { NEELAM } = require('../../../constants/wallets')

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'auctionDat... Remove this comment to see the full error message
const auctionData = {
  item_type: NEELAM,
  quantity: 2,
  initial_price: 100,
  end_time: Date.now() + 60 * 60 * 1000
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'auctionKey... Remove this comment to see the full error message
const auctionKeys = [
  'auctions',
  'message'
]

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'auctionWit... Remove this comment to see the full error message
const auctionWithIdKeys = [
  'bidders_and_bids',
  'end_time',
  'highest_bid',
  'item',
  'quantity',
  'seller',
  'start_time'
]

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { auctionData, auctionKeys, auctionWithIdKeys }
