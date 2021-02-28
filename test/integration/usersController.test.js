const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')

// Import fixtures
const githubUserInfo = require('../fixtures/auth/githubUserInfo')()

chai.use(chaiHttp)

let jwt

describe('Users', function () {
  before(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('POST /users - create one user', function () {
    it('Should return success response after adding the user', function (done) {
      chai
        .request(app)
        .post('/users')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          first_name: 'Nikhil',
          last_name: 'Bhandarkar',
          yoe: 0,
          img: './img.png',
          github_id: 'whydonti',
          linkedin_id: 'nikhil-bhandarkar',
          twitter_id: 'whatifi'
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User added successfully!')
          expect(res.body.userId).to.be.a('string')

          return done()
        })
    })

    it('Should return 409 if user already exists', function (done) {
      chai
        .request(app)
        .post('/users')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          first_name: 'Nikhil',
          last_name: 'Bhandarkar',
          yoe: 0,
          img: './img.png',
          github_id: 'whydonti',
          linkedin_id: 'nikhil-bhandarkar',
          twitter_id: 'whatifi'
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(409)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User already exists')

          return done()
        })
    })
  })

  describe('PATCH /users/self', function () {
    it('Should update the user', function (done) {
      chai
        .request(app)
        .patch('/users/self')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          first_name: 'Test first_name'
        })
        .end((err, res) => {
          if (err) { return done() }
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
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Users returned successfully!')
          expect(res.body.users).to.be.a('array')

          return done()
        })
    })
  })

  describe('GET /users/id', function () {
    it('Should return one user with given id', function (done) {
      chai
        .request(app)
        .get(`/users/${githubUserInfo[0].username}`)
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User returned successfully!')
          expect(res.body.user).to.be.a('object')

          return done()
        })
    })

    it('Should return 404 if there is no user in the system', function (done) {
      chai
        .request(app)
        .get('/users/invalidUser')
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User doesn\'t exist')

          return done()
        })
    })
  })

  describe('GET /users/isUsernameAvailable/username', function () {
    it('Should return userAvailable as true as we are passing new user', function (done) {
      chai
        .request(app)
        .get('/users/isUsernameAvailable/availableUser')
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.userAvailable).to.equal(true)

          return done()
        })
    })

    it('Should return userAvailable as false as we are passing existing user', function (done) {
      chai
        .request(app)
        .get(`/users/userAvailable/${githubUserInfo[0].username}`)
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.userAvailable).to.equal(false)

          return done()
        })
    })
  })
})
