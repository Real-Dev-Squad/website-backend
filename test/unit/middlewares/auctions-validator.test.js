import { expect } from "chai";
import sinon from "sinon";

import auctionsValidator from "../../../middlewares/validators/auctions.js";
const { createAuction, placeBid } = auctionsValidator;

describe("auctions validator", function () {
  describe("create auctions validator", function () {
    it("allows the request to pass", async function () {
      const req = {
        body: {
          item_type: "css art",
          quantity: 100,
          initial_price: 100,
          end_time: 1234234234,
        },
      };
      const res = {};
      const nextSpy = sinon.spy();
      await createAuction(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("stops the request to propogate to next", async function () {
      const req = {
        body: {
          "": "",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await createAuction(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
      });
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });

  describe("place bid validator", function () {
    it("allows the request to pass", async function () {
      const req = {
        body: {
          bid: 100,
        },
      };
      const res = {};
      const nextSpy = sinon.spy();
      await placeBid(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.equal(true);
    });

    it("stops the request to propogate to next", async function () {
      const req = {
        body: {
          "": "",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = sinon.spy();
      await placeBid(req, res, nextSpy).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(nextSpy.callCount).to.be.equal(0);
      });
    });
  });
});
