const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const authService = require('../../../services/authService')

chai.use(chaiHttp)

afterEach(() => {
  sinon.restore()
})

describe('authService', function () {
  it('should validate the generated JWT', done => {
    const payload = { userId: 1 }
    const jwt = authService.generateAuthToken(payload)
    const decodedValue = authService.verifyAuthToken(jwt)

    expect(decodedValue).to.have.all.keys('userId', 'iat', 'exp')
    expect(decodedValue.userId).to.equal(payload.userId)

    return done()
  })
})
