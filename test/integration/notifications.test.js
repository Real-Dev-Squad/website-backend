const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')

const config = require('config')
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

describe('Notifications', function () {
  let jwt
  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('GET /notifications', function () {
    const page = 1
    const limit = 5

    it('Should get all the notifications for the loggedIn user in system', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page, n: limit })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Notifications returned successfully!')
          expect(res.body.data).to.be.a('array')
          expect(res.body.data[0]).to.not.have.property('userId')
          expect(res.body.data[0]).to.have.property('username')
          expect(res.body.data[0]).to.have.property('currentPage')
          return done()
        })
    })

    it('Should return 401 if not logged in', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page, n: limit })
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

    const negativePage = -4

    it('Should return 400 if page is not a positive integer', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page: negativePage, n: limit })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Please Check your query'
          })

          return done()
        })
    })

    const negativeLimit = -4
    it('Should return 400 if limit is not a positive integer', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page, n: negativeLimit })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Please Check your query'
          })

          return done()
        })
    })

    const invalidPage = 'invalidPageNumber'
    it('Should return 400 if page is not a valid Number', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page: invalidPage, n: limit })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Please Check your query'
          })

          return done()
        })
    })

    const invalidLimit = 'invalidLimit'
    it('Should return 400 if limit is not a valid Number', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page, n: invalidLimit })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Please Check your query'
          })

          return done()
        })
    })

    it('Should return 400 if page  is missing in the query', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ n: limit })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Please Check your query'
          })

          return done()
        })
    })

    it('Should return 400 if limit  is missing in the query', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Please Check your query'
          })

          return done()
        })
    })

    it('Should return 400 if both page and limit are missing in the query', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(400)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Please Check your query'
          })

          return done()
        })
    })
  })
})
