import { NEELAM } from "../../../constants/wallets.js";

/* Import fixtures
 *
 * Sample wallet for tests
 *
 * @return {Object}
 */

export const auctionData = {
  item_type: NEELAM,
  quantity: 2,
  initial_price: 100,
  end_time: Date.now() + 60 * 60 * 1000,
};

export const auctionKeys = ["auctions", "message"];

export const auctionWithIdKeys = [
  "bidders_and_bids",
  "end_time",
  "highest_bid",
  "item",
  "quantity",
  "seller",
  "start_time",
];

export default { auctionData, auctionKeys, auctionWithIdKeys };
