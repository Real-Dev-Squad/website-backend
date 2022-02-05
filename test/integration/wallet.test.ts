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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'usersUtils... Remove this comment to see the full error message
const usersUtils = require('../../utils/users')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'walletBody... Remove this comment to see the full error message
const { walletBodyKeys, walletKeys, walletDataKeys } = require('../fixtures/wallet/wallet')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'defaultUse... Remove this comment to see the full error message
const defaultUser = userData[0]
const newUser = userData[3]
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'superUser'... Remove this comment to see the full error message
const superUser = userData[4]

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Wallet', function () {
  let authToken: any
  let userId: any
  let userName: any

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    userId = await addUser(defaultUser)
    authToken = authService.generateAuthToken({ userId })
    userName = await usersUtils.getUsername(userId)
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /wallet', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return wallet information of the logged in user', function (done: any) {
      chai
        .request(app)
        .get('/wallet')
        .set('cookie', `${cookieName}=${authToken}`)
        .end((error: any, response: any) => {
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

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return the user their own wallet with 1000 dineros loaded', function (done: any) {
      chai
        .request(app)
        .get('/wallet')
        .set('cookie', `${cookieName}=${authToken}`)
        .end((error: any, response: any) => {
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

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Without cookie access should be unauthorized', function (done: any) {
      chai
        .request(app)
        .get('/wallet')
        .end((error: any, response: any) => {
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /wallet/:username', function () {
    let newUserId
    let newUserAuthToken: any

    let superUserId
    let superUserAuthToken: any

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
    before(async function () {
      newUserId = await addUser(newUser)
      newUserAuthToken = authService.generateAuthToken({ userId: newUserId })

      superUserId = await addUser(superUser)
      superUserAuthToken = authService.generateAuthToken({ userId: superUserId })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return wallet when trying to access someone else\'s wallet, using authorized user (super_user)', function (done: any) {
      chai
        .request(app)
        .get(`/wallet/${userName}`)
        .set('cookie', `${cookieName}=${superUserAuthToken}`)
        .end((error: any, response: any) => {
          if (error) {
            return done(error)
          }

          expect(response).to.have.status(200)
          expect(response.body.wallet.data.userId).to.be.equal(userId)
          expect(response.body.message).to.be.equal('Wallet returned successfully')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return unauthorized error when trying to access someone else\'s wallet when not authorized', function (done: any) {
      chai
        .request(app)
        .get(`/wallet/${userName}`)
        .set('cookie', `${cookieName}=${newUserAuthToken}`)
        .end((error: any, response: any) => {
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
