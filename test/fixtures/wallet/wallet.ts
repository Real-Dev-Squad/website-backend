/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'walletKeys... Remove this comment to see the full error message
const walletKeys = [
  'id',
  'data'
]

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'walletBody... Remove this comment to see the full error message
const walletBodyKeys = [
  'message',
  'wallet'
]

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'walletData... Remove this comment to see the full error message
const walletDataKeys = [
  'userId',
  'isActive',
  'currencies'
]

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { walletBodyKeys, walletKeys, walletDataKeys }
