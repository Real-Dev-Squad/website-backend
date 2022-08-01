const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");

const stockQuery = require("../../../models/stocks");
const stocksModel = firestore.collection("stocks");

const stockDataArray = require("../../fixtures/stocks/stocks")();

describe("stocks", function () {
  let stock;
  beforeEach(async function () {
    stock = await stockQuery.addStock(stockDataArray[0]);
  });
  afterEach(async function () {
    await cleanDb();
  });

  describe("addStock", function () {
    it("should add the stock", async function () {
      const data = (await stocksModel.doc(stock.id).get()).data();

      expect(data).to.deep.equal(stockDataArray[0]);
      expect(stock.stockData).to.deep.equal(stockDataArray[0]);
    });
  });

  describe("fetchStocks", function () {
    it("should return all stocks", async function () {
      const response = await stockQuery.fetchStocks();

      expect(response).to.be.a("array");
      expect(response[0]).to.deep.equal({
        ...stockDataArray[0],
        id: stock.id,
      });
    });
  });
});
