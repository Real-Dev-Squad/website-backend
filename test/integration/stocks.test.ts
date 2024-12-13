import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../server";
import authService from "../../services/authService";
import addUser from "../utils/addUser";
import cleanDb from "../utils/cleanDb";
import stocks from "../../models/stocks";
import sinon from "sinon";
import config from "config";

const cookieName: string = config.get("userToken.cookieName");
chai.use(chaiHttp);
const { expect } = chai;

describe("GET /stocks/:userId", function () {
  let jwt: string;
  let userId: string;
  let userStock;
  const stockData = { name: "EURO", quantity: 2, price: 10 };

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    const { id } = await stocks.addStock(stockData);
    userStock = { stockId: id, stockName: "EURO", quantity: 1, orderValue: 10, initialStockValue: 2 };
  });

  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });

  it("Should return user stocks when stocks are available", async function () {
    await stocks.updateUserStocks(userId, userStock);

    const res = await chai.request(app).get(`/stocks/${userId}?dev=true`).set("cookie", `${cookieName}=${jwt}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("object");
    expect(res.body.message).to.equal("User stocks returned successfully!");
    expect(res.body.userStocks).to.be.an("array");
    expect(res.body.userStocks.map(({ id, ...rest }) => rest)).to.deep.equal([{ ...userStock, userId }]);
  });

  it("Should return empty object when no stocks are found", function (done) {
    chai
      .request(app)
      .get(`/stocks/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("No stocks found");
        expect(res.body.userStocks).to.be.an("array");

        return done();
      });
  });

  it("Should return 403 for unauthorized access", function (done) {
    const userId = "anotherUser123";

    chai
      .request(app)
      .get(`/stocks/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(403);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Unauthorized access");

        return done();
      });
  });

  it("Should return 500 when an internal server error occurs", function (done) {
    sinon.stub(stocks, "fetchUserStocks").throws(new Error("Database error"));

    chai
      .request(app)
      .get(`/stocks/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("An internal server error occurred");

        return done();
      });
  });
});
