const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const app = require('../../server')
const authService = require('../../services/authService')

describe('healthController', function () {
  it('should return uptime from the healthcheck API', function (done) {
    chai
      .request(app)
      .get('/healthcheck')
      .end((err, res) => {
        if (err) { return done() }

        expect(res).to.have.status(200)
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('uptime').that.is.a('number')
        return done()
      })
  })

  it('should return 401 from the authenticated healthcheck API for missing auth tokens', function (done) {
    chai
      .request(app)
      .get('/healthcheck/v2')
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

  it('should return 200 from the authenticated healthcheck API when token is passed', function (done) {
    const jwt = authService.generateAuthToken({ userId: 1 })

    chai
      .request(app)
      .get('/healthcheck/v2')
      .set('cookie', `rds-session=${jwt}`)
      .end((err, res) => {
        if (err) { return done() }

        expect(res).to.have.status(200)
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('uptime').that.is.a('number')

        return done()
      })
  })
})
