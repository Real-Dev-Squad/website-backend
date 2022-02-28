// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authServic... Remove this comment to see the full error message
const authService = require('../../../services/authService')

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('authService', function () {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should validate the generated JWT', function (done) {
    const payload = { userId: 1 }
    const jwt = authService.generateAuthToken(payload)
    const decodedValue = authService.verifyAuthToken(jwt)

    expect(decodedValue).to.have.all.keys('userId', 'iat', 'exp')
    expect(decodedValue.userId).to.equal(payload.userId)

    return done()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should decode the generated JWT', function (done) {
    const payload = { userId: 1 }
    const jwt = authService.generateAuthToken(payload)
    const decodedValue = authService.decodeAuthToken(jwt)

    expect(decodedValue).to.have.all.keys('userId', 'iat', 'exp')
    expect(decodedValue.userId).to.equal(payload.userId)

    return done()
  })
})
