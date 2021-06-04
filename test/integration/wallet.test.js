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
// const newUser = userData[3]
// const superUser = userData[4]

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

  describe('Check /wallet', function () {
    it('Should return userId and wallet information', function (done) {
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
  })

  describe('GET /wallet/:username of own username', function () {
    it('Should return the user his own wallet', function (done) {
      chai
        .request(app)
        .get('/wallet/')
        .set('cookie', `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(200)
          expect(response.body.wallet.data.userId).to.be.equal(userId)

          return done()
        })
    })
  })

  describe('Check if the newly created wallet (by default we create a wallet for the new user) for the new user is pre-loader with 1000 dineros', function () {
    it('Should return the user his own wallet with 1000 dineros', function (done) {
      chai
        .request(app)
        .get('/wallet/')
        .set('cookie', `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(200)
          expect(response.body.wallet.data.currencies.dinero).to.be.equal(1000)

          return done()
        })
    })
  })

  /*
    router.get('/:username', authenticate, authorizeUser('superUser'), wallet.getUserWallet)
  */

  describe('GET /wallet/:username of different username without authorization', function () {
    // before(async function () {
    //   user = await usersUtils.getUsername(userId)
    //   console.log('___________user___________')
    //   console.log(userId)
    //   console.log(user)
    //   console.log(userName)
    // })
    it('Should return unauthorized when trying to access someone else\'s wallet when not authorized', function (done) {
      chai
        .request(app)
        .get(`/wallet/${userName}`)
        .set('cookie', `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error)
          }
          return done()
        })
    })
  })

  // describe('GET /wallet/:username of different username with authorization', function () {
  // })
})
