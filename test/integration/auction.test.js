const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
// const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')

const { createNewAuction } = require('../../models/auctions')
const { createWallet } = require('../../models/wallets')

// Import fixtures
const userData = require('../fixtures/user/user')()
const auctionData = require('../fixtures/auctions/auctions')
const currenciesData = require('../fixtures/currencies/currencies')

// const config = require('config')
// const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

describe('Auctions', function () {
  // let jwt
  let auctionId

  beforeEach(async function () {
    const userId = await addUser()
    // jwt = authService.generateAuthToken({ userId })
    await createWallet(userId, currenciesData)
    auctionId = await createNewAuction({ seller: userId, ...auctionData })
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('GET /auctions', function () {
    it('Should return the going auctions', function (done) {
      chai
        .request(app)
        .get('/auctions')
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Auctions returned successfully!')
          expect(res.body.auctions).to.be.a('array')
          return done()
        })
    })
  })

  describe('GET /auctions/:id', function () {
    it('Should return the going auctions', function (done) {
      chai
        .request(app)
        .get(`/auctions/${auctionId}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.seller).to.be.eql(userData[0].username)
          return done()
        })
    })
  })
})
