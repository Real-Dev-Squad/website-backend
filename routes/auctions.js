const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const auction = require("../controllers/auction");
const auctionValidator = require("../middlewares/validators/auctions");

router.get("/:id", auction.fetchAuctionById);
router.get("/", auction.fetchAvailableAuctions);
router.post("/bid/:id", authenticate, auctionValidator.placeBid, auction.makeNewBid);
router.post("/", authenticate, auctionValidator.createAuction, auction.createNewAuction);

module.exports = router;
