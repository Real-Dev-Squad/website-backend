const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')
const users = require('../../models/users')

// Import fixtures
const userData = require('../fixtures/user/user')()

const config = require('config')
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

describe('Users', function () {
  let jwt

  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('POST /users - create one user', function () {
    it('Should return success response after adding the user', function (done) {
      chai
        .request(app)
        .post('/users')
        .set('cookie', `${cookieName}=${jwt}`)
        .send(userData[1])
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User added successfully!')
          expect(res.body.userId).to.be.a('string')

          return done()
        })
    })

    it('Should return 409 if user already exists', async function () {
      const userDataClone = Object.assign({}, userData[1])

      await users.addOrUpdate(userDataClone)

      chai
        .request(app)
        .post('/users')
        .set('cookie', `${cookieName}=${jwt}`)
        .send(userData[1])
        .end((err, res) => {
          if (err) { throw err }

          expect(res).to.have.status(409)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User already exists')
        })
    })
  })

  describe('PATCH /users/self', function () {
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
  })

  describe('GET /users', function () {
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
          expect(res.body.users).to.not.have.property('phone')
          expect(res.body.users).to.not.have.property('email')

          return done()
        })
    })
  })

  describe('GET /users/self', function () {
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

  describe('GET /users/id', function () {
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
})
