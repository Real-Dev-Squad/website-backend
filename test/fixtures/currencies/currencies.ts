// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DINERO'.
const { DINERO, NEELAM } = require('../../../constants/wallets')

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

const currencies = {
  [DINERO]: 1000,
  [NEELAM]: 2
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = currencies
