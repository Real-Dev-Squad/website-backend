/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

const currencies = [
  'neelam',
  'dinero'
]

const walletKeys = [
  'id',
  'data'
]

const walletBodyKeys = [
  'message',
  'wallet'
]

const walletDataKeys = [
  'userId',
  'isActive',
  'currencies'
]

module.exports = { currencies, walletBodyKeys, walletKeys, walletDataKeys }
