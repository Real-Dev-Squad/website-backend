const { DINERO, NEELAM } = require("../../../constants/wallets");

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

module.exports = {
  default: {
    [DINERO]: 1000,
    [NEELAM]: 2,
  },
  modified: {
    [DINERO]: 2000,
    [NEELAM]: 0,
  },
};
