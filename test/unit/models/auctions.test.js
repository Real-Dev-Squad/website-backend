const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const auctions = require("../../../models/auctions");
const firestore = require("../../../utils/firestore");
const auctionModel = firestore.collection("auctions");
const { auctionData } = require("../../fixtures/auctions/auctions");
const addUser = require("../../utils/addUser");
const user = require("../../fixtures/user/user")();
const { initial_price: initialPrice, item_type: itemType, end_time: endTime, quantity } = auctionData;

describe("auctions", function () {
  let seller, auctionId;

  beforeEach(async function () {
    seller = await addUser();
    auctionId = await auctions.createNewAuction({ seller, initialPrice, itemType, endTime, quantity });
  });
  afterEach(async function () {
    await cleanDb();
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
      const response = await auctions.fetchAuctionById("undefined");

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
    it("Should return not found", async function () {
      const response = await auctions.fetchAuctionById("undefined");

      expect(response).to.be.equal(false);
    });
  });

  describe("makeNewBid", function () {
    it("Should return auction not found", async function () {
      const response = await auctions.makeNewBid({ bidder: seller, auctionId: "badAuctionId", bid: 300 });

      expect(response).to.be.a("object");
      expect(response.auctionNotFound).to.be.equal(true);
    });
  });
});
