const chai = require('chai')
const sinon = require('sinon')
const passport = require('passport')
const { expect } = chai
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const app = require('../../server')

// Import fixtures
const githubUserInfo = require('../fixtures/auth/githubUserInfo')()

afterEach(() => {
  sinon.restore()
})

describe('authController', function () {
  it('should return success response on successful login', done => {
    sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, 'accessToken', githubUserInfo[0])
      return (req, res, next) => {}
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
          msg: 'success'
        })

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
