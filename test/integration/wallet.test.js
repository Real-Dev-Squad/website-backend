const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')

const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')
const usersUtils = require('../../utils/users')

const userData = require('../fixtures/user/user')()
const { walletBodyKeys, walletKeys, walletDataKeys } = require('../fixtures/wallet/wallet')

const defaultUser = userData[0]
const newUser = userData[3]
const superUser = userData[4]

const config = require('config')
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

describe('Wallet', function () {
  let authToken
  let userId
  let userName

  beforeEach(async function () {
    userId = await addUser(defaultUser)
    authToken = authService.generateAuthToken({ userId })
    userName = await usersUtils.getUsername(userId)
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('GET /wallet', function () {
    it('Should return wallet information of the logged in user', function (done) {
      chai
        .request(app)
        .get('/wallet')
        .set('cookie', `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(200)
          expect(response.body).to.be.a('object')
          expect(response.body).to.have.all.keys(...walletBodyKeys)
          expect(response.body.message).to.be.equal('Wallet returned successfully for user')
          expect(response.body.wallet).to.be.a('object')
          expect(response.body.wallet).to.have.all.keys(...walletKeys)
          expect(response.body.wallet.data).to.have.all.keys(...walletDataKeys)

          return done()
        })
    })

    it('Should return the user their own wallet with 1000 dineros loaded', function (done) {
      chai
        .request(app)
        .get('/wallet')
        .set('cookie', `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(200)
          expect(response.body.wallet.data.userId).to.be.equal(userId)
          expect(response.body.message).to.be.equal('Wallet returned successfully for user')
          expect(response.body.wallet.data.currencies.dinero).to.be.equal(1000)

          return done()
        })
    })

    it('Without cookie access should be unauthorized', function (done) {
      chai
        .request(app)
        .get('/wallet')
        .end((error, response) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(401)
          expect(response.body.error).to.be.equal('Unauthorized')
          expect(response.body.message).to.be.equal('Unauthenticated User')

          return done()
        })
    })
  })

  describe('GET /wallet/:username', function () {
    let newUserId
    let newUserAuthToken

    let superUserId
    let superUserAuthToken

    before(async function () {
      newUserId = await addUser(newUser)
      newUserAuthToken = authService.generateAuthToken({ userId: newUserId })

      superUserId = await addUser(superUser)
      superUserAuthToken = authService.generateAuthToken({ userId: superUserId })
    })

    it('Should return wallet when trying to access someone else\'s wallet, using authorized user (super_user)', function (done) {
      chai
        .request(app)
        .get(`/wallet/${userName}`)
        .set('cookie', `${cookieName}=${superUserAuthToken}`)
        .end((error, response) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(200)
          expect(response.body.wallet.data.userId).to.be.equal(userId)
          expect(response.body.message).to.be.equal('Wallet returned successfully')

          return done()
        })
    })

    it('Should return unauthorized error when trying to access someone else\'s wallet when not authorized', function (done) {
      chai
        .request(app)
        .get(`/wallet/${userName}`)
        .set('cookie', `${cookieName}=${newUserAuthToken}`)
        .end((error, response) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(401)
          expect(response.body.error).to.be.equal('Unauthorized')
          expect(response.body.message).to.be.equal('You are not authorized for this action.')

          return done()
        })
    })
  })
})
