// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = require('chai')
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'featureFla... Remove this comment to see the full error message
const featureFlagQuery = require('../../models/featureFlags')

// Import fixtures
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'featureFla... Remove this comment to see the full error message
const featureFlagData = require('../fixtures/featureFlag/featureFlag')()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appOwner'.
const appOwner = userData[5]
chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('FeatureFlag', function () {
  let jwt: any
  let featureFlag: any
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    const userId = await addUser(appOwner)
    jwt = authService.generateAuthToken({ userId })
    featureFlag = await featureFlagQuery.addFeatureFlags(featureFlagData[0], appOwner.username)
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /featureFlags', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return all feature flags', function (done: any) {
      chai
        .request(app)
        .get('/featureFlags')
        .end((res: any, err: any) => {
          if (err) { return done() }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('FeatureFlags returned successfully!')
          expect(res.body.featureFlags).to.be.a('array')

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('POST /featureFlags', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should add the feature flag in db', function (done: any) {
      chai
        .request(app)
        .post('/featureFlags')
        .set('cookie', `${cookieName} = ${jwt}`)
        .send({
          name: 'test',
          title: 'test-feature',
          config: {
            enabled: true
          }
        }, appOwner.username)
        .end((err: any, res: any) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          const { data } = res.body
          expect(data).to.be.a('object')
          expect(data.name).to.be.a('string')
          expect(data.title).to.be.a('string')
          expect(data.created_at).to.be.a('number')
          expect(data.updated_at).to.be.a('number')
          expect(data.config).to.be.a('object')
          expect(data.config.enabled).to.be.a('boolean')
          expect(data.owner).to.be.a('string')
          expect(res.body.message).to.equal('FeatureFlag added successfully!')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401 if user not logged in', function (done: any) {
      chai
        .request(app)
        .post('/featureFlags')
        .end((res: any, err: any) => {
          if (err) { return done() }

          expect(res).to.have.status(401)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User'
          })

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('PATCH /featureFlags/:id', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should update the feature flag', function (done: any) {
      chai
        .request(app)
        .patch(`/featureFlags/${featureFlag.id}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          config: {
            enabled: false
          }
        })
        .end((err: any, res: any) => {
          if (err) { return done() }
          expect(res).to.have.status(204)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401 if user not logged in', function (done: any) {
      chai
        .request(app)
        .patch(`/featureFlags/${featureFlag.id}`)
        .end((res: any, err: any) => {
          if (err) { return done() }

          expect(res).to.have.status(401)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User'
          })

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404 if feature flag does not exist', function (done: any) {
      chai
        .request(app)
        .patch('/featureFlags/featureFlagId')
        .end((res: any, err: any) => {
          if (err) { return done() }

          expect(res).to.have.status(404)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'No featureFlag found'
          })

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('DELETE /featureFlags/:id', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should delete the feature flag', function (done: any) {
      chai
        .request(app)
        .delete(`/featureFlags/${featureFlag.id}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err: any, res: any) => {
          if (err) { return done() }

          expect(res).to.have.status(200)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401 if user not logged in', function (done: any) {
      chai
        .request(app)
        .delete(`/featureFlags/${featureFlag.id}`)
        .end((res: any, err: any) => {
          if (err) { return done() }

          expect(res).to.have.status(401)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User'
          })

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404 if feature flag does not exist', function (done: any) {
      chai
        .request(app)
        .delete('/featureFlags/featureFlagId')
        .end((res: any, err: any) => {
          if (err) { return done() }

          expect(res).to.have.status(404)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'No feature flag found'
          })

          return done()
        })
    })
  })
})
