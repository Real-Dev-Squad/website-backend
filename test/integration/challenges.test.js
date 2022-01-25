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

describe('Challenges', function () {
  let jwt

  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('GET /challenges', function () {
    it('Should return the available challenges', function (done) {
      chai
        .request(app)
        .get('/challenges')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Challenges returned successfully!')
          expect(res.body.challenges).to.be.a('array')

          return done()
        })
    })
    it('Should return a not found message if the challenges is not found', function (done) {
      chai
        .request(app)
        .get('/challenges')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body.challenges).to.eql([])
          expect(res.body.message).to.be.equal('No Challenges found')

          return done()
        })
    })
  })

  describe('POST /challenges', function () {
    it('Should create a new challenge', function (done) {
      chai
        .request(app)
        .post('/challenges')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'Test challenge-create',
          level: 'easy',
          start_date: 123,
          end_date: 456
        })
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Challenge added successfully')

          return done()
        })
    })
  })

  describe('POST /subscribe', function () {
    it('Should subscribe user to a challenge', function (done) {
      chai
        .request(app)
        .post('/challenges/subscribe')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.challengeId).to.be.a('string')

          return done()
        })
    })
    it('Should respond 404 if unable to subscribe user to a challenge', function (done) {
      chai
        .request(app)
        .get('/challenges/subscribe')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('User cannot be subscribed to challenge')
          return done()
        })
    })
  })
})
