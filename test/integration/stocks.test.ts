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

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
  });

  afterEach(async function () {
    await cleanDb();
    sinon.restore();
  });

  it("Should return user stocks when stocks are available", function (done) {
    const userStocks = [{id: "5YGjUSW1SinwCNfuLXOO", userId: "DHLG3gYMTtMenj6lciWz", stockId: "s2eYDswDUAoQxwAhh07f", stockName: "EURO", quantity: 1, orderValue: 150, initialStockValue: 150}];

    sinon.stub(stocks, "fetchUserStocks").resolves(userStocks);

    chai
      .request(app)
      .get(`/stocks/${userId}?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("User stocks returned successfully!");
        expect(res.body.userStocks).to.be.an("array");
        expect(res.body.userStocks).to.deep.equal(userStocks);

        return done();
      });
  });

  it("Should return empty object when no stocks are found", function (done) {
    const userStocks=[];

    sinon.stub(stocks, "fetchUserStocks").resolves(userStocks);

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
    // Stub fetchUserStocks to throw an error
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