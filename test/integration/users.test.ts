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

// Import fixtures
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Users', function () {
  let jwt

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('PATCH /users/self', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should update the user', function (done) {
      chai
        .request(app)
        .patch('/users/self')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          first_name: 'Test first_name'
        })
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(204)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should update the user status', function (done) {
      chai
        .request(app)
        .patch('/users/self')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          status: 'ooo'
        })
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(204)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 400 for invalid status value', function (done) {
      chai
        .request(app)
        .patch('/users/self')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          status: 'blah'
        })
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: '"status" must be one of [ooo, idle, active]'
          })

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /users', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should get all the users in system', function (done) {
      chai
        .request(app)
        .get('/users')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Users returned successfully!')
          expect(res.body.users).to.be.a('array')
          expect(res.body.users[0]).to.not.have.property('phone')
          expect(res.body.users[0]).to.not.have.property('email')

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /users/self', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return the logged user\'s details', function (done) {
      chai
        .request(app)
        .get('/users/self')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.not.have.property('phone')
          expect(res.body).to.not.have.property('email')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return details with phone and email when query \'private\' is true', function (done) {
      chai
        .request(app)
        .get('/users/self')
        .query({ private: true })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('phone')
          expect(res.body).to.have.property('email')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401 if not logged in', function (done) {
      chai
        .request(app)
        .get('/users/self')
        .end((err, res) => {
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
  describe('GET /users/id', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return one user with given id', function (done) {
      chai
        .request(app)
        .get(`/users/${userData[0].username}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User returned successfully!')
          expect(res.body.user).to.be.a('object')
          expect(res.body.user).to.not.have.property('phone')
          expect(res.body.user).to.not.have.property('email')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404 if there is no user in the system', function (done) {
      chai
        .request(app)
        .get('/users/invalidUser')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User doesn\'t exist')

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /users/isUsernameAvailable/username', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return isUsernameAvailable as true as we are passing new user', function (done) {
      chai
        .request(app)
        .get('/users/isUsernameAvailable/availableUser')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.isUsernameAvailable).to.equal(true)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return isUsernameAvailable as false as we are passing existing user', function (done) {
      chai
        .request(app)
        .get(`/users/isUsernameAvailable/${userData[0].username}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.isUsernameAvailable).to.equal(false)

          return done()
        })
    })
  })
})
