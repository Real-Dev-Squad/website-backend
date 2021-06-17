const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const config = require('config')
const cookieName = config.get('userToken.cookieName')
chai.use(chaiHttp)

describe('Short Urls', function () {
  let jwt
  before(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('POST /url - creates a new shortUrl for the URL provided', function () {
    it('Should return success response after creating the url Object', function (done) {
      chai
        .request(app)
        .post('/url')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          shortUrl: 'RDStest12',
          longUrl: 'http://rds-test.com'
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Url created successfully')
          expect(res.body.urlData).to.be.a('object')
          return done()
        })
    })
    it('Should return 401 if not logged in', function (done) {
      chai
        .request(app)
        .post('/url')
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
})
