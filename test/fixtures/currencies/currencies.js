import { DINERO, NEELAM } from "../../../constants/wallets.js";

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

export default {
  default: {
    [DINERO]: 1000,
    [NEELAM]: 2,
  },
  modified: {
    [DINERO]: 2000,
    [NEELAM]: 0,
  },
};
