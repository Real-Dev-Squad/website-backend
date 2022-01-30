const chai = require('chai');
const { expect } = chai;
const chaiHttp = require('chai-http');

const app = require('../../server');
const authService = require('../../services/authService');
const addUser = require('../utils/addUser');
const cleanDb = require('../utils/cleanDb');

const { createNewAuction } = require('../../models/auctions');
const { createWallet } = require('../../models/wallets');

// Import fixtures
const userData = require('../fixtures/user/user')();
const { auctionData, auctionKeys, auctionWithIdKeys } = require('../fixtures/auctions/auctions');
const { initial_price: initialPrice, item_type: itemType, end_time: endTime, quantity } = auctionData;
const currenciesData = require('../fixtures/currencies/currencies');

const config = require('config');
const cookieName = config.get('userToken.cookieName');

chai.use(chaiHttp);

describe('Auctions', function () {
  let jwt;
  let auctionId;

  beforeEach(async function () {
    const userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    await createWallet(userId, currenciesData);
    auctionId = await createNewAuction({ seller: userId, initialPrice, endTime, itemType, quantity });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe('GET /auctions', function () {
    it('Should return the ongoing auctions', function (done) {
      chai
        .request(app)
        .get('/auctions')
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(...auctionKeys);
          expect(res.body.message).to.be.equal('Auctions returned successfully!');
          expect(res.body.auctions).to.be.a('array');

          return done();
        });
    });
  });

  describe('GET /auctions/:id', function () {
    it('Should return the ongoing auctions for given Id', function (done) {
      chai
        .request(app)
        .get(`/auctions/${auctionId}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(...auctionWithIdKeys);
          expect(res.body.item).to.be.a('string');
          expect(res.body.quantity).to.be.a('number');
          expect(res.body.end_time).to.be.a('number');
          expect(res.body.highest_bid).to.be.a('number');
          expect(res.body.start_time).to.be.a('number');
          expect(res.body.bidders_and_bids).to.be.a('array');
          expect(res.body.seller).to.be.equal(userData[0].username);
          expect(res.body.item).to.be.equal(auctionData.item_type);
          expect(res.body.quantity).to.be.equal(auctionData.quantity);
          expect(res.body.end_time).to.be.equal(auctionData.end_time);
          expect(res.body.highest_bid).to.be.equal(auctionData.initial_price);

          return done();
        });
    });

    it('Should return 404, for Auction not found', function (done) {
      chai
        .request(app)
        .get('/auctions/invalidId')
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal("Auction doesn't exist");

          return done();
        });
    });
  });

  describe('POST /auctions', function () {
    it('Should create a new auction', function (done) {
      chai
        .request(app)
        .post('/auctions')
        .set('cookie', `${cookieName}=${jwt}`)
        .send(auctionData)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.be.equal('Auction created successfully!');

          return done();
        });
    });

    it('User should have enough items in wallet to sell', function (done) {
      chai
        .request(app)
        .post('/auctions')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ ...auctionData, quantity: 5 })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(403);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.be.equal(`You do not have enough of ${itemType}s!`);

          return done();
        });
    });

    it('Should return 401, for Unauthenticated User', function (done) {
      chai
        .request(app)
        .post('/auctions')
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a('object');
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User',
          });

          return done();
        });
    });
  });

  describe('POST /auctions/bid/:id', function () {
    it('Should make a new bid with given auctionId', function (done) {
      chai
        .request(app)
        .post(`/auctions/bid/${auctionId}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ bid: 500 })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.be.equal('Successfully placed bid!');

          return done();
        });
    });

    it('User should have sufficient balance for bidding', function (done) {
      chai
        .request(app)
        .post(`/auctions/bid/${auctionId}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ bid: 1001 })

        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(403);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.be.equal('You do not have sufficient money');

          return done();
        });
    });

    it('Bid Should be higher than the previous bid', function (done) {
      chai
        .request(app)
        .post(`/auctions/bid/${auctionId}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ bid: 50 })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(403);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.be.equal('Your bid was not higher than current one!');

          return done();
        });
    });

    it('Should return 401, for Unauthenticated User', function (done) {
      chai
        .request(app)
        .post('/auctions/bid/invalidId')
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a('object');
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User',
          });

          return done();
        });
    });
  });
});
