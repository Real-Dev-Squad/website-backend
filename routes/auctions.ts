import express from "express";
import authenticate from "../middlewares/authenticate";
import auction from "../controllers/auction";
import auctionValidator from "../middlewares/validators/auctions";
const router = express.Router();

router.get("/:id", auction.fetchAuctionById);
router.get("/", auction.fetchAvailableAuctions);
router.post("/bid/:id", authenticate, auctionValidator.placeBid, auction.makeNewBid);
router.post("/", authenticate, auctionValidator.createAuction, auction.createNewAuction);

export default  router;
