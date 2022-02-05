// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('../../server')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authServic... Remove this comment to see the full error message
const authService = require('../../services/authService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../utils/addUser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../utils/cleanDb')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createNewA... Remove this comment to see the full error message
const { createNewAuction } = require('../../models/auctions')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createWall... Remove this comment to see the full error message
const { createWallet } = require('../../models/wallets')

// Import fixtures
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'auctionDat... Remove this comment to see the full error message
const { auctionData, auctionKeys, auctionWithIdKeys } = require('../fixtures/auctions/auctions')
const { initial_price: initialPrice, item_type: itemType, end_time: endTime, quantity } = auctionData
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const currenciesData = require('../fixtures/currencies/currencies')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Auctions', function () {
  let jwt: any
  let auctionId: any

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
    await createWallet(userId, currenciesData)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    auctionId = await createNewAuction({ seller: userId, initialPrice, endTime, itemType, quantity })
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /auctions', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return the ongoing auctions', function (done: any) {
      chai
        .request(app)
        .get('/auctions')
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.all.keys(...auctionKeys)
          expect(res.body.message).to.be.equal('Auctions returned successfully!')
          expect(res.body.auctions).to.be.a('array')

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /auctions/:id', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return the ongoing auctions for given Id', function (done: any) {
      chai
        .request(app)
        .get(`/auctions/${auctionId}`)
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.all.keys(...auctionWithIdKeys)
          expect(res.body.item).to.be.a('string')
          expect(res.body.quantity).to.be.a('number')
          expect(res.body.end_time).to.be.a('number')
          expect(res.body.highest_bid).to.be.a('number')
          expect(res.body.start_time).to.be.a('number')
          expect(res.body.bidders_and_bids).to.be.a('array')
          expect(res.body.seller).to.be.equal(userData[0].username)
          expect(res.body.item).to.be.equal(auctionData.item_type)
          expect(res.body.quantity).to.be.equal(auctionData.quantity)
          expect(res.body.end_time).to.be.equal(auctionData.end_time)
          expect(res.body.highest_bid).to.be.equal(auctionData.initial_price)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404, for Auction not found', function (done: any) {
      chai
        .request(app)
        .get('/auctions/invalidId')
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Auction doesn\'t exist')

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('POST /auctions', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should create a new auction', function (done: any) {
      chai
        .request(app)
        .post('/auctions')
        .set('cookie', `${cookieName}=${jwt}`)
        .send(auctionData)
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(201)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Auction created successfully!')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('User should have enough items in wallet to sell', function (done: any) {
      chai
        .request(app)
        .post('/auctions')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ ...auctionData, quantity: 5 })
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(403)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal(`You do not have enough of ${itemType}s!`)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401, for Unauthenticated User', function (done: any) {
      chai
        .request(app)
        .post('/auctions')
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User'
          })

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('POST /auctions/bid/:id', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should make a new bid with given auctionId', function (done: any) {
      chai
        .request(app)
        .post(`/auctions/bid/${auctionId}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ bid: 500 })
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(201)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Successfully placed bid!')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('User should have sufficient balance for bidding', function (done: any) {
      chai
        .request(app)
        .post(`/auctions/bid/${auctionId}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ bid: 1001 })

        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(403)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('You do not have sufficient money')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Bid Should be higher than the previous bid', function (done: any) {
      chai
        .request(app)
        .post(`/auctions/bid/${auctionId}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({ bid: 50 })
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(403)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Your bid was not higher than current one!')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401, for Unauthenticated User', function (done: any) {
      chai
        .request(app)
        .post('/auctions/bid/invalidId')
        .end((err: any, res: any) => {
          if (err) {
            return done(err)
          }

          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User'
          })

          return done()
        })
    })
  })
})
