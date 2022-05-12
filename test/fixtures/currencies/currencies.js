const { DINERO, NEELAM } = require("../../../constants/wallets");

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

module.exports = [
  {
    [DINERO]: 1000,
    [NEELAM]: 2,
  },
  {
    [DINERO]: 2000,
    [NEELAM]: 0,
  },
  {
    [DINERO]: 1000,
  },
];
