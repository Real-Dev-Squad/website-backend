import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../server.js";
import { generateAuthToken } from "../../services/authService.js";
import addUser from "../utils/addUser.js";
import cleanDb from "../utils/cleanDb.js";
import * as stocksModel from "../../models/stocks.js";
import * as walletModel from "../../models/wallets.js";
import sinon from "sinon";
import config from "config";
import currencies from "../fixtures/currencies/currencies.js";
import * as tradeService from "../../services/tradingService.js";

const cookieName: string = config.get("userToken.cookieName");
chai.use(chaiHttp);
const { expect } = chai;

describe("POST /trade/stock/new/:userId", function () {
  let jwt: string;
  let userId: string;
  let userStock;
  const newStockData = { name: "DINERO", quantity: 20000, price: 2 };
  let id;
  let stockData;

  beforeEach(async function () {
    userId = await addUser();
    jwt = generateAuthToken({ userId });
    ({ id, stockData } = await stocksModel.addStock(newStockData));
    await walletModel.createWallet(userId, currencies.default);
    userStock = {
      stockId: id,
      stockName: stockData.name,
      tradeType: "BUY",
      quantity: 1,
      listedPrice: stockData.price,
      totalPrice: 1 * stockData.price,
    };
  });

  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });

  it("Should return success when trade is completed", function (done) {
    chai
      .request(app)
      .post(`/trade/stock/new/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .send(userStock)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Congrats, Stock Trade done successfully!! 🎉🎉🎉🎊🎊🎊");
        expect(res.body.userBalance).to.be.a("number");
        return done();
      });
  });

  it("Should return trade unsuccessful due to insufficient funds", function (done) {
    userStock.tradeType = "BUY";
    userStock.quantity = 2000;
    userStock.totalPrice = 2000 * stockData.price;

    chai
      .request(app)
      .post(`/trade/stock/new/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .send(userStock)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(403);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Trade was not successful due to insufficient funds");
        return done();
      });
  });

  it("Should return trade unsuccessful due to insufficient stock quantity", function (done) {
    userStock.tradeType = "SELL";
    userStock.quantity = 20001;
    userStock.totalPrice = 20001 * stockData.price;

    chai
      .request(app)
      .post(`/trade/stock/new/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .send(userStock)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(403);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Trade was not successful because you do not have enough quantity");
        return done();
      });
  });

  it("Should return 500 when an internal server error occurs", function (done) {
    sinon.stub(tradeService, "trade").throws(new Error("Database error"));

    chai
      .request(app)
      .post(`/trade/stock/new/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .send(userStock)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("An internal server error occurred");
        return done();
      });
  });
});
