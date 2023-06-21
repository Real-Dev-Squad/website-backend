const Sinon = require("sinon");
const { createAuction, placeBid } = require("../../../middlewares/validators/auctions");
const { expect } = require("chai");

let nextSpy;
let badRequestSpy;
describe("test the auctions validator", function () {
  beforeEach(function () {
    nextSpy = Sinon.spy();
    badRequestSpy = Sinon.spy();
  });
  afterEach(function () {
    Sinon.reset();
  });
  describe("create auctions validator", function () {
    it("lets the request pass for a valid request", async function () {
      const req = {
        body: {
          item_type: "Dummy-type",
          quantity: 1,
          initial_price: 10,
          end_time: 163428574930,
        },
      };
      const res = {};
      await createAuction(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("does not let the request pass for invalid request", async function () {
      const req = {
        body: {},
      };
      const res = {
        boom: {
          badRequest: badRequestSpy,
        },
      };
      const nextSpy = Sinon.spy();
      await createAuction(req, res, nextSpy);
      expect(badRequestSpy.calledOnce).to.be.equal(true);
      expect(nextSpy.calledOnce).to.be.equal(false);
    });
  });

  describe("place bid validator", function () {
    it("lets the request pass for a valid request", async function () {
      const req = {
        body: {
          bid: 100,
        },
      };
      const res = {};
      await placeBid(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("does not let the request pass for invalid request", async function () {
      const req = {
        body: {},
      };
      const res = {
        boom: {
          badRequest: badRequestSpy,
        },
      };
      await createAuction(req, res, nextSpy);
      expect(badRequestSpy.calledOnce).to.be.equal(true);
      expect(nextSpy.calledOnce).to.be.equal(false);
    });
  });
});
