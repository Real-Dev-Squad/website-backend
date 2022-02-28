// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { authorizeUser } = require('../../middlewares/authorization')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const authenticate = require('../../middlewares/authenticate')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authServic... Remove this comment to see the full error message
const authService = require('../../services/authService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../utils/addUser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../utils/cleanDb')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'defaultUse... Remove this comment to see the full error message
const defaultUser = userData[0] // user with no `roles` key
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appOwner'.
const appOwner = userData[3]
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'superUser'... Remove this comment to see the full error message
const superUser = userData[4]

// Setup some routes with various permissions for testing
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const express = require('express')
const router = express.Router()
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const AppMiddlewares = require('../../middlewares')

const pongHandler = (_, res) => {
  return res.json({ message: 'pong' })
}

router.get('/for-everyone', authenticate, pongHandler)
router.get('/for-app-owner', authenticate, authorizeUser('appOwner'), pongHandler)
router.get('/for-super-user', authenticate, authorizeUser('superUser'), pongHandler)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = express()
AppMiddlewares(app)
app.use('/', router)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('authorizeUser', function () {
  let defaultJwt, appOwnerJwt, superUserJwt

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
  before(async function () {
    const defaultUserId = await addUser(defaultUser)
    const appOwnerId = await addUser(appOwner)
    const superUserId = await addUser(superUser)
    defaultJwt = authService.generateAuthToken({ userId: defaultUserId })
    appOwnerJwt = authService.generateAuthToken({ userId: appOwnerId })
    superUserJwt = authService.generateAuthToken({ userId: superUserId })
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should authorize default user for route with no required role', function (done) {
    chai
      .request(app)
      .get('/for-everyone')
      .set('cookie', `${cookieName}=${defaultJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }
        expect(res).to.have.status(200)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should authorize user with role for route with no required role', function (done) {
    chai
      .request(app)
      .get('/for-everyone')
      .set('cookie', `${cookieName}=${appOwnerJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }
        expect(res).to.have.status(200)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should authorize appOwner for route with appOwner required role', function (done) {
    chai
      .request(app)
      .get('/for-app-owner')
      .set('cookie', `${cookieName}=${appOwnerJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }
        expect(res).to.have.status(200)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not allow user not having role for route with appOwner required role', function (done) {
    chai
      .request(app)
      .get('/for-app-owner')
      .set('cookie', `${cookieName}=${defaultJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }
        expect(res).to.have.status(401)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should authorize superUser for route with appOwner required role', function (done) {
    chai
      .request(app)
      .get('/for-app-owner')
      .set('cookie', `${cookieName}=${superUserJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }
        expect(res).to.have.status(200)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should authorize superUser for route with superUser required role', function (done) {
    chai
      .request(app)
      .get('/for-super-user')
      .set('cookie', `${cookieName}=${superUserJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }
        expect(res).to.have.status(200)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not allow appOwner for route with superUser required role', function (done) {
    chai
      .request(app)
      .get('/for-super-user')
      .set('cookie', `${cookieName}=${appOwnerJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }
        expect(res).to.have.status(401)
        return done()
      })
  })
})
