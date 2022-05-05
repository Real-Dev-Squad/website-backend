const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const addUser = require("../../utils/addUser");

// Import models
const auctions = require("../../../models/auctions");
const walletsQuery = require("../../../models/wallets");
const auctionModel = firestore.collection("auctions");
const bidModel = firestore.collection("bids");

// Import fixtures
const { auctionData } = require("../../fixtures/auctions/auctions");
const user = require("../../fixtures/user/user")();
const currencyDataArray = require("../../fixtures/currencies/currencies");
const currencies = currencyDataArray[0];

const { initial_price: initialPrice, item_type: itemType, end_time: endTime, quantity } = auctionData;

describe("auctions", function () {
  let seller, auctionId, bidder;

  beforeEach(async function () {
    seller = await addUser();
    bidder = await addUser(user[1]);
    auctionId = await auctions.createNewAuction({ seller, initialPrice, itemType, endTime, quantity });
  });
  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });

  describe("createNewAuction", function () {
    it("Should create a new auction", async function () {
      const data = (await auctionModel.doc(auctionId).get()).data();

      expect(data).to.be.a("Object");
      expect(data.highest_bid).to.be.equal(initialPrice);
      expect(data.item).to.be.equal(itemType);
      expect(data.end_time).to.be.equal(endTime);
      expect(data.quantity).to.be.equal(quantity);
      expect(data.seller).to.be.equal(seller);
      expect(data.highest_bidder).to.be.equal(null);
    });
  });

  describe("fetchAuctionById", function () {
    it("Should return the auction data", async function () {
      const response = await auctions.fetchAuctionById(auctionId);

      expect(response).to.be.a("object");
      expect(response.highest_bid).to.be.equal(initialPrice);
      expect(response.item).to.be.equal(itemType);
      expect(response.end_time).to.be.equal(endTime);
      expect(response.quantity).to.be.equal(quantity);
      expect(response.seller).to.be.equal(user[0].username);
      expect(response.bidders_and_bids).to.be.a("array").with.lengthOf(0);
      expect(response.highest_bidder).to.be.equal(undefined);
    });
    it("Should return not found", async function () {
      const response = await auctions.fetchAuctionById("invalidAuctionId");

      expect(response).to.be.equal(false);
    });
  });

  describe("fetchAvailableAuctions", function () {
    it("Should return all available auctions", async function () {
      const responses = await auctions.fetchAvailableAuctions();
      const auction = responses[0];

      expect(responses).to.be.a("array").with.lengthOf(1);
      expect(auction.highest_bid).to.be.equal(initialPrice);
      expect(auction.item).to.be.equal(itemType);
      expect(auction.end_time).to.be.equal(endTime);
      expect(auction.quantity).to.be.equal(quantity);
      expect(auction.seller).to.be.equal(user[0].username);
      expect(auction.bidders).to.be.a("array").with.lengthOf(0);
      expect(auction.highest_bidder).to.be.equal(undefined);
    });
    it("Should return empty array", async function () {
      await cleanDb();
      auctionId = await auctions.createNewAuction({
        seller,
        initialPrice,
        itemType,
        endTime: Date.now() - 60 * 60 * 1000,
        quantity,
      });
      const response = await auctions.fetchAvailableAuctions();

      expect(response).to.be.a("array").with.lengthOf(0);
    });
  });

  describe("makeNewBid", function () {
    const highestBid = initialPrice;
    it("Should return bid id and make a new bid", async function () {
      sinon.stub(walletsQuery, "fetchWallet").returns({ currencies, isActive: true, userId: bidder });
      const bidId = await auctions.makeNewBid({ bidder, auctionId, bid: highestBid + 50 });
      const bidData = (await bidModel.doc(bidId).get()).data();

      expect(bidData.bidder).to.be.equal(bidder);
      expect(bidData.auction_id).to.be.equal(auctionId);
      expect(bidData.bid).to.be.equal(highestBid + 50);
    });
    it("Should return auction not found", async function () {
      const response = await auctions.makeNewBid({ bidder, auctionId: "invalidAuctionId", bid: highestBid + 50 });

      expect(response).to.be.a("object");
      expect(response.auctionNotFound).to.be.equal(true);
    });
    it("Should return wallet not found", async function () {
      const response = await auctions.makeNewBid({ bidder, auctionId, bid: highestBid + 50 });

      expect(response).to.be.a("object");
      expect(response.noWallet).to.be.equal(true);
    });
    it("Should return low bid", async function () {
      sinon.stub(walletsQuery, "fetchWallet").returns({ currencies, isActive: true, userId: bidder });
      const response = await auctions.makeNewBid({ bidder, auctionId, bid: highestBid - 50 });

      expect(response).to.be.a("object");
      expect(response.lowBid).to.be.equal(true);
    });
    it("Should return insufficient money", async function () {
      sinon.stub(walletsQuery, "fetchWallet").returns({ currencies, isActive: true, userId: bidder });
      const response = await auctions.makeNewBid({ bidder, auctionId, bid: currencies.dinero + 50 });

      expect(response).to.be.a("object");
      expect(response.insufficientMoney).to.be.equal(true);
    });
  });
});
