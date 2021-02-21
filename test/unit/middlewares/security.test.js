const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../../server')

chai.use(chaiHttp)

describe('CORS', function () {
  it('should allow preflight requests from allowed domains', function (done) {
    const origin = 'https://www.realdevsquad.com'

    chai
      .request(app)
      .options('/users')
      .set('origin', origin)
      .send()
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(200)
        expect(res.body).to.eql({})
        expect(res.headers).to.include({
          'access-control-allow-origin': origin
        })

        return done()
      })
  })

  it('should allow preflight requests from localhost in test env', function (done) {
    const origin = 'http://localhost:3000'

    chai
      .request(app)
      .options('/users')
      .set('origin', origin)
      .send()
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(200)
        expect(res.body).to.eql({})
        expect(res.headers).to.include({
          'access-control-allow-origin': origin
        })

        return done()
      })
  })

  it('should not allow preflight requests from non specified origin', function (done) {
    const origin = 'http://notspecifieddomain.com'

    chai
      .request(app)
      .options('/users')
      .set('origin', origin)
      .send()
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(200)
        expect(res.body).to.eql({})
        expect(res.headers).to.not.have.property('access-control-allow-origin')

        return done()
      })
  })
})
