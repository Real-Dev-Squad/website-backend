const chai = require('chai')
const sinon = require('sinon')
const config = require('config')
const { expect } = chai
const chaiHttp = require('chai-http')
const passport = require('passport')

const users = require('../../models/users')
const app = require('../../server')

chai.use(chaiHttp)

// Import fixtures
const githubUserInfo = require('../fixtures/auth/githubUserInfo')()

afterEach(() => {
  sinon.restore()
})

describe('authController', function () {
  it('should return success response on successful login and JWT token in the cookie', done => {
    sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, 'accessToken', githubUserInfo[0])
      return (req, res, next) => {}
    })

    sinon.stub(users, 'addOrUpdate').callsFake((userData) => {
      return { isNewUser: true, userId: 'userId' }
    })

    chai
      .request(app)
      .get('/auth/github/callback')
      .query({ code: 'codeReturnedByGithub' })
      .end((err, res) => {
        if (err) { return done() }

        expect(res).to.have.status(200)
        expect(res.body).to.be.an('object')
        expect(res.body).to.eql({
          isNewUser: true
        })

        expect(res.headers['set-cookie']).to.have.length(1)
        expect(res.headers['set-cookie'][0]).to.be.a('string')
          .and.satisfy(msg => msg.startsWith(config.get('userToken.cookieName')))

        return done()
      })
  })

  it('should return 401 if github call fails', done => {
    chai
      .request(app)
      .get('/auth/github/callback')
      .query({ code: 'codeReturnedByGithub' })
      .end((err, res) => {
        if (err) { return done() }

        expect(res).to.have.status(401)
        expect(res.body).to.be.an('object')
        expect(res.body).to.eql({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'User cannot be authenticated'
        })

        return done()
      })
  })
})
