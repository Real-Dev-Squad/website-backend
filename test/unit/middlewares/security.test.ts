// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('../../../server')

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CORS', function () {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
